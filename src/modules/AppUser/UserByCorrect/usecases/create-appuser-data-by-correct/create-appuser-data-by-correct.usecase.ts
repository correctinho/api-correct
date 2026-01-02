import csv from 'csv-parser';
import { Readable } from 'stream';
import { CustomError } from '../../../../../errors/custom.error';
import { AppUserInfoRequest } from '../../../app-user-dto/app-user.dto';
import { IAppUserInfoRepository } from '../../../AppUserManagement/repositories/app-user-info.repository';
import {
    AppUserInfoCreateCommand,
    AppUserInfoEntity,
    AppUserInfoProps,
} from '../../../AppUserManagement/entities/app-user-info.entity';
import { ICompanyDataRepository } from '../../../../Company/CompanyData/repositories/company-data.repository';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { IAppUserAuthRepository } from '../../../AppUserManagement/repositories/app-use-auth-repository';
import { IBusinessItemDetailsRepository } from '../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository';
import { OutputFindEmployerItemDetailsDTO } from '../../../../Company/BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto';
import { InputCreateAppUserDataByCorrectDTO } from './dto/-create-app-user-data-by-correct.dto';
import {
    AppUserItemCreateCommand,
    AppUserItemEntity,
} from '../../../AppUserManagement/entities/app-user-item.entity';
import { ItemCategory, UserItemStatus } from '@prisma/client';
import { BenefitGroupsEntity } from '../../../../Company/BenefitGroups/entities/benefit-groups.entity';
import { IAppUserItemRepository } from '../../../AppUserManagement/repositories/app-user-item-repository';
import { IBenefitsRepository } from '../../../../benefits/repositories/benefit.repository';

//let employerActiveItems: OutputFindEmployerItemDetailsDTO[] = [];

export class CreateAppUserByCorrectUsecaseTest {
    constructor(
        private appUserInfoRepository: IAppUserInfoRepository,
        private businessRepository: ICompanyDataRepository,
        private appUserAuthRepository: IAppUserAuthRepository,
        private employerItemsRepository: IBusinessItemDetailsRepository,
        private employeeItemRepository: IAppUserItemRepository,
        private benefitsRepository: IBenefitsRepository
    ) { }

    async execute(data: InputCreateAppUserDataByCorrectDTO) {
        console.log(`Iniciando cadastro em massa de colaboradores via Correct Admin para a empresa ${data.business_info_uuid} ...`);
        let validatedUser: AppUserInfoEntity[] = [];
        let errorUser: string[] = [];
        let usersRegistered: string[] = [];

        if (!data.business_info_uuid)
            throw new CustomError('Business Id is required', 400);

        console.log("Validando empresa...");
        const business = await this.businessRepository.findById(
            data.business_info_uuid
        );
        if (!business) throw new CustomError('Business not found', 404);

        console.log("Verificando se empresa está ativa...");
        if (business.status !== 'active')
            throw new CustomError('Business must be activated', 400);

        //check if employer has registered items
        console.log("Verificando itens cadastrados para a empresa...");
        const employerItems = await this.employerItemsRepository.findAllEmployerItems(
            data.business_info_uuid
        );

        const employerActiveItems = employerItems.filter(item => item.is_active);
        if (employerActiveItems.length === 0) throw new CustomError('Employer has no active items', 404);


        //await this.mapEmployerActiveItems(employerItems);
        if (employerActiveItems.length === 0)
            throw new CustomError('Employer has no active items', 404);
        console.log("Lendo arquivo CSV...");
        const usersFromCSV = await this.readCSV(data.fileBuffer);

        // 4. Busca do Benefício (FEITO AQUI, UMA ÚNICA VEZ)
        console.log("Buscando benefício 'Correct'...");
        const benefit = await this.benefitsRepository.findByName('Correct');
        if (!benefit) throw new CustomError('Benefit not found', 404)

        // 5. PROCESSAMENTO EM LOTES: Validação e Criação de Entidades (Memória)
        // Isso substitui a chamada antiga de this.validateUser
        console.log(`Validando ${usersFromCSV.length} usuários em lotes de 50...`);

        await this.processInChunks(usersFromCSV, 50, async (userCsvRow) => {
            try {
                // Monta o comando completo com os dados do CSV + o UUID do benefício buscado acima
                const userCommand: AppUserInfoCreateCommand = {
                    business_info_uuid: new Uuid(data.business_info_uuid),
                    address_uuid: null,
                    document: userCsvRow.document,
                    document2: userCsvRow.document2,
                    document3: null,
                    full_name: userCsvRow.full_name,
                    display_name: '',
                    internal_company_code: userCsvRow.internal_company_code,
                    gender: userCsvRow.gender,
                    date_of_birth: userCsvRow.date_of_birth,
                    phone: null,
                    email: null,
                    salary: userCsvRow.salary,
                    company_owner: userCsvRow.company_owner,
                    status: 'pending',
                    function: userCsvRow.user_function,
                    recommendation_code: null,
                    is_authenticated: false,
                    marital_status: userCsvRow.marital_status,
                    dependents_quantity: userCsvRow.dependents_quantity,
                    user_document_validation_uuid: null,
                    is_employee: true,
                    debit_benefit_uuid: benefit.uuid, // <--- USA O BENEFÍCIO AQUI
                };

                // Cria a entidade (síncrono/rápido)
                const appUserEntity = await AppUserInfoEntity.create(userCommand);
                validatedUser.push(appUserEntity);

            } catch (error: any) {
                errorUser.push(
                    `Erro ao validar dados do CPF ${userCsvRow.document}: ${error.message || error}`
                );
            }
        });

        // 6. PROCESSAMENTO EM LOTES: Persistência no Banco (I/O Pesado)
        console.log(`Salvando ${validatedUser.length} usuários válidos no banco em lotes de 10...`);

        await this.processInChunks(validatedUser, 10, async (userEntity) => {
            try {
                // Chama a lógica de salvar um único usuário (que contém os upserts, etc)
                // Você precisará extrair a lógica de dentro do antigo loop "processUsers" para este método
                await this.processSingleUserPersistence(
                    userEntity,
                    data.business_info_uuid,
                    usersRegistered,
                    employerActiveItems // <--- Passando a lista limpa
                );
            } catch (error: any) {
                errorUser.push(
                    `Erro ao salvar no banco CPF ${userEntity.document}: ${error.message || error}`
                );
            }
        });
       

        return { usersRegistered, errorUser };
    }

    private async readCSV(fileBuffer: Buffer): Promise<AppUserInfoRequest[]> {
        let usersFromCSV: AppUserInfoRequest[] = [];

        return new Promise((resolve, reject) => {
            const stream = Readable.from(fileBuffer.toString());

            stream
                .pipe(csv({ separator: ',' }))
                .on('data', (data) => {
                    try {
                        if (
                            data['\ufeffcodigo_interno'] &&
                            data['company_owner'] &&
                            data['nome_completo'] &&
                            data['sexo'] &&
                            data['rg'] &&
                            data['cpf'] &&
                            data['data_nascimento'] &&
                            data['estado_civil'] &&
                            data['total_dependentes'] &&
                            data['cargo'] &&
                            data['remuneracao']
                        ) {
                            const internal_company_code =
                                data['\ufeffcodigo_interno'];
                            const company_owner = JSON.parse(
                                data['company_owner']
                            );
                            const full_name = data['nome_completo'];
                            const gender = data['sexo'];
                            const document2 = data['rg'];
                            const document = data['cpf'];
                            const date_of_birth = data['data_nascimento'];
                            const marital_status = data['estado_civil'];
                            const dependents_quantity =
                                +data['total_dependentes'];
                            const user_function = data['cargo'];
                            const salary = Number(data['remuneracao']);

                            const userDataFromCSV: AppUserInfoRequest = {
                                document,
                                document2,
                                full_name,
                                internal_company_code,
                                gender,
                                company_owner,
                                date_of_birth,
                                marital_status,
                                dependents_quantity,
                                user_function,
                                salary,
                            };

                            usersFromCSV.push(userDataFromCSV);
                        } else {
                            throw new CustomError('Caiu aqui', 400);
                        }
                    } catch (err) {
                        reject(err);
                    }
                })
                .on('end', () => {
                    resolve(usersFromCSV);
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    }

   
    // Método extraído para processar UM usuário no banco
    private async processSingleUserPersistence(
        user: AppUserInfoEntity,
        business_info_uuid: string,
        usersRegistered: string[],
        employerActiveItems: OutputFindEmployerItemDetailsDTO[]
    ) {
        // 1. Buscas iniciais
        const existingUserInfo = await this.appUserInfoRepository.findByDocumentUserInfo(user.document);
        const findUserAuth = await this.appUserAuthRepository.findByDocument(user.document);

        let employeeItemsArray: AppUserItemEntity[] = [];

        // 2. Lógica de Itens (Employer Items)
        for (const employerItem of employerActiveItems) {
            const group = employerItem.BenefitGroups.find((group) => group.is_default === true);

            // Verifica se funcionário já tem o item
            const employeeAlreadyHasItem = await this.employeeItemRepository.findItemByEmployeeAndBusiness(
                user.uuid.uuid,
                user.business_info_uuid.uuid,
                employerItem.item_uuid
            );

            if (employeeAlreadyHasItem) {
                const hydratedItem = AppUserItemEntity.hydrate(employeeAlreadyHasItem);
                employeeItemsArray.push(hydratedItem);
            }

            // Monta dados do item padrão
            const defaultGroup = {
                uuid: new Uuid(group.uuid),
                group_name: group.group_name,
                employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
                value: group.value,
                is_default: group.is_default,
                business_info_uuid: new Uuid(group.business_info_uuid),
                created_at: group.created_at,
            };

            const employeeItemData: AppUserItemCreateCommand = {
                business_info_uuid: user.business_info_uuid,
                user_info_uuid: existingUserInfo ? new Uuid(existingUserInfo.uuid) : user.uuid,
                item_uuid: new Uuid(employerItem.item_uuid),
                item_name: employerItem.Item.name,
                item_category: employerItem.Item.item_category as ItemCategory,
                balance: defaultGroup.value / 100,
                group_uuid: defaultGroup.uuid,
                group_name: defaultGroup.group_name,
                group_value: defaultGroup.value / 100,
                group_is_default: defaultGroup.is_default,
                status: 'inactive' as UserItemStatus,
                employee_salary: user.salary,
            };

            const newEmployeeItemEntity = AppUserItemEntity.create(employeeItemData);
            employeeItemsArray.push(newEmployeeItemEntity);
        }

        // 3. Atualização de UUIDs se usuário já existe
        if (existingUserInfo) {
            user.changeUuid(new Uuid(existingUserInfo.uuid));
            for (const employeeItem of employeeItemsArray) {
                employeeItem.changeUserInfoUuid(new Uuid(existingUserInfo.uuid));
            }

            // Salva/Atualiza (Chama o repositório que corrigimos o UPSERT)
            await this.appUserInfoRepository.saveOrUpdateByCSV(user, employeeItemsArray);

            const isAlreadyAnEmployee = existingUserInfo.Employee.find(
                (business) => business.business_info_uuid === business_info_uuid
            );

            if (isAlreadyAnEmployee) {
                await this.appUserInfoRepository.updateEmployeeByCSV(
                    user,
                    isAlreadyAnEmployee,
                    employeeItemsArray
                );
            } else {
                await this.appUserInfoRepository.createEmployeeAndItems(
                    user,
                    employeeItemsArray
                );
            }
            usersRegistered.push(user.document);
        }

        // 4. Lógica se usuário NÃO existe
        if (!existingUserInfo && !findUserAuth) {
            await this.appUserInfoRepository.createUserInfoAndEmployee(
                user,
                employeeItemsArray
            );
            usersRegistered.push(user.document);
        } else if (findUserAuth && !existingUserInfo) {
            await this.appUserInfoRepository.createUserInfoandUpdateUserAuthByCSV(
                user,
                employeeItemsArray
            );
            usersRegistered.push(user.document);
        }
    }

    // private async mapEmployerActiveItems(
    //     employerItems: OutputFindEmployerItemDetailsDTO[]
    // ) {
    //     for (const item of employerItems) {
    //         if (item.is_active) {
    //             employerActiveItems.push(item);
    //         }
    //     }
    // }

    private async processInChunks<T, R>(
        items: T[],
        chunkSize: number,
        iterator: (item: T) => Promise<R>
    ): Promise<void> {
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            // Processa o lote atual em paralelo e espera todos terminarem antes de ir para o próximo
            await Promise.all(chunk.map(item => iterator(item)));
        }
    }
}

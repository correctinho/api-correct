// src/modules/Benefits/usecases/release-credits-to-employees/release-credits-to-employees.usecase.ts

import { CustomError } from "../../../../../errors/custom.error"; // Assumindo o caminho
import { AppUserInfoEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-info.entity";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { OutputGetEmployeesByBusinessDTO } from "../../../../AppUser/AppUserManagement/usecases/UserInfo/get-users-by-business-admin/dto/get-user-by-business.dto";
import { CompanyDataEntity } from "../../../../Company/CompanyData/entities/company-data.entity";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { ReleaseCreditsToEmployeesDTO } from "./dto/release-credits-to-employees.dto";
import { EmployeeStatus, ItemCategory, UserItemEventType } from '@prisma/client'; // Enums do Prisma

export class ReleaseCreditsToEmployeesUsecase {
    constructor(
        private businessInfoRepository: ICompanyDataRepository,
        private employeeItemsRepository: IAppUserItemRepository,
        private employeeRepository: IAppUserInfoRepository
    ) {}

    async execute(data: ReleaseCreditsToEmployeesDTO): Promise<any> {
        // 1. Validar e preparar inputs
        this.validateInput(data);
        const totalAmountInCents = Math.round(data.amountDepositedByEmployerInReais * 100);

        // 2. Validar empregador
        const employer = await this.validateAndRetrieveEmployer(data.employerId);

        // 3. Buscar colaboradores ativos
        const activeEmployees = await this.retrieveActiveEmployeesData(employer.uuid);

        // Se não houver colaboradores ativos, retorna um resultado informativo
        if (activeEmployees.length === 0) {
            return {
                totalDepositedAmountInReais: totalAmountInCents / 100,
                totalProvisionedAmountInReais: 0,
                remainingAmountInReais: totalAmountInCents / 100,
                provisionedUserItemsCount: 0,
                failedProvisionsCount: 0,
                message: "No active employees found for this employer. No credits released."
            };
        }

        // 4. Buscar UserItems (benefícios) dos colaboradores ativos
        const userItemsToProvision = await this.retrieveUserItemsToProvision(employer.uuid, activeEmployees);

        // Se não houver UserItems ativos para provisionar, retorna um resultado informativo
        if (userItemsToProvision.length === 0) {
            return {
                totalDepositedAmountInReais: totalAmountInCents / 100,
                totalProvisionedAmountInReais: 0,
                remainingAmountInReais: totalAmountInCents / 100,
                provisionedUserItemsCount: 0,
                failedProvisionsCount: 0,
                message: "No active benefits found for employees. No credits released."
            };
        }

        // 5. Executar a lógica de distribuição e provisionamento
        return await this.distributeAndProvisionCredits(
            totalAmountInCents,
            employer.uuid,
            userItemsToProvision
        );
    }

    // ------------------------------------------------------------------------------------------------
    // MÉTODOS AUXILIARES PRIVADOS
    // ------------------------------------------------------------------------------------------------

    private validateInput(data: ReleaseCreditsToEmployeesDTO): void {
        if (!data.employerId) {
            throw new CustomError("Employer ID is required", 400);
        }

        const amount = data.amountDepositedByEmployerInReais;
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            throw new CustomError("Amount to be released must be a positive number", 400);
        }
        if (Math.round(amount * 100) <= 0) {
            throw new CustomError("Amount to be released must be a positive number after conversion to cents", 400);
        }
    }

    private async validateAndRetrieveEmployer(employerId: string): Promise<CompanyDataEntity> {
        const employer = await this.businessInfoRepository.findById(employerId);
        if (!employer) {
            throw new CustomError("Employer not found", 404);
        }

        // Assumindo que o BusinessInfo tem um 'business_type' e 'status'
        if (employer.business_type === 'autonomo_comercio' || employer.business_type === 'comercio') {
            throw new CustomError("Business is not an Employer type", 403);
        }
        if (employer.status !== 'active') { // Assumindo que BusinessInfo também tem um campo status
            throw new CustomError("Employer is not active", 403);
        }
        return employer;
    }

    private async retrieveActiveEmployeesData(employerUuid: string): Promise<OutputGetEmployeesByBusinessDTO[]> {
        // IMPORTANTE: Agora chamamos o método do userInfoRepository
        const activeEmployees = await this.employeeRepository.findManyByBusiness(employerUuid);
        return activeEmployees; // Retorna array vazio se não houver
    }

    private async retrieveUserItemsToProvision(
        employerUuid: string,
        // IMPORTANTE: Recebe o DTO de OutputGetEmployeesByBusinessDTO
        employeesData: OutputGetEmployeesByBusinessDTO[] 
    ): Promise<AppUserItemEntity[]> {
        // Mapeia para obter apenas os user_info_uuids do DTO
        const userInfoUuids = employeesData.map(emp => emp.user_info_uuid);
        
        const userItems = await this.employeeItemsRepository.findUserItemsWithBenefitGroupsByEmployerAndUserInfoIds(
            employerUuid,
            userInfoUuids
        );
        return userItems; // Retorna array vazio se não houver
    }

    private async distributeAndProvisionCredits(
        totalAmountInCents: number,
        employerUuid: string,
        userItemsToProvision: AppUserItemEntity[]
    ): Promise<any> { 
        let remainingAmountInCentsToDistribute = totalAmountInCents;
        let provisionedCount = 0;
        let totalProvisionedAmountInCents = 0;
        const failedProvisions: string[] = [];

        // Itera sobre cada UserItem que deve ser provisionado
        for (const userItem of userItemsToProvision) {
            try {
                // 1. Validações de dados do UserItem
                if (!userItem.group_uuid || userItem.group_value === null || userItem.group_value === undefined) {
                    console.warn(`WARN: UserItem ${userItem.uuid?.uuid} (AppUser: ${userItem.user_info_uuid?.uuid}) lacks an associated BenefitGroup or group value. Skipping provision.`);
                    failedProvisions.push(`UserItem ${userItem.uuid?.uuid}: Missing BenefitGroup or value.`);
                    continue;
                }

                if (!userItem.item_category) {
                    console.warn(`WARN: UserItem ${userItem.uuid?.uuid} (AppUser: ${userItem.user_info_uuid?.uuid}) lacks 'item_category'. Skipping provision.`);
                    failedProvisions.push(`UserItem ${userItem.uuid?.uuid}: Missing item_category.`);
                    continue;
                }

                // >>> CONVERTER GETTERS (QUE RETORNAM REAIS) PARA CENTAVOS PARA CÁLCULOS INTERNOS <<<
                const currentBalanceInCents = Math.round(userItem.balance * 100); 
                const groupValueInCents = Math.round(userItem.group_value * 100);

                let amountToAffectBalance: number; // O valor que será deduzido do depósito do empregador
                let newBalanceInCents: number;      // O saldo final que o UserItem terá

                // 2. Aplicar a lógica de 'pre_pago' vs. 'pos_pago'
                if (userItem.item_category === ItemCategory.pos_pago) {
                    newBalanceInCents = groupValueInCents; // Saldo é resetado para o valor do grupo
                    amountToAffectBalance = newBalanceInCents - currentBalanceInCents; // Gasto do depósito é a diferença
                } else if (userItem.item_category === ItemCategory.pre_pago) {
                    amountToAffectBalance = groupValueInCents; // Gasto do depósito é o valor completo do grupo
                    newBalanceInCents = currentBalanceInCents + amountToAffectBalance; // Saldo é incrementado
                } else {
                    console.warn(`WARN: UserItem ${userItem.uuid?.uuid} (AppUser: ${userItem.user_info_uuid?.uuid}) has an unknown 'item_category': ${userItem.item_category}. Skipping provision.`);
                    failedProvisions.push(`UserItem ${userItem.uuid?.uuid}: Unknown item_category '${userItem.item_category}'.`);
                    continue;
                }

                // 3. Regra de Distribuição: O valor total depositado pelo empregador é o limite.
                if (remainingAmountInCentsToDistribute < amountToAffectBalance) {
                    amountToAffectBalance = remainingAmountInCentsToDistribute;
                    if (amountToAffectBalance < 0) amountToAffectBalance = 0; // Garante que não é negativo

                    // Recalcular newBalanceInCents com o amountToAffectBalance limitado
                    if (userItem.item_category === ItemCategory.pos_pago) {
                        newBalanceInCents = amountToAffectBalance;
                    } else { // pre_pago
                        newBalanceInCents = currentBalanceInCents + amountToAffectBalance;
                    }
                }
                
                // 4. Condições para Pular o Provisionamento (evitar atualizações desnecessárias ou nulas)
                if (currentBalanceInCents === newBalanceInCents) {
                    console.log(`INFO: UserItem ${userItem.uuid?.uuid} (AppUser: ${userItem.user_info_uuid?.uuid}) balance ${currentBalanceInCents / 100} R$ already matches target ${newBalanceInCents / 100} R$. Skipping update.`);
                    continue;
                }
                if (amountToAffectBalance === 0) { // Se nada será adicionado/subtraído efetivamente
                    console.log(`INFO: UserItem ${userItem.uuid?.uuid} (AppUser: ${userItem.user_info_uuid?.uuid}) has 0 R$ effective change in balance. Skipping update.`);
                    continue;
                }
                
                // 5. Registrar o provisionamento no repositório (transacional)
                await this.employeeItemsRepository.updateBalanceAndHistory(
                    userItem.uuid?.uuid as string, // Usar .uuid do Value Object Uuid
                    newBalanceInCents,            // Saldo final em centavos
                    currentBalanceInCents,        // Saldo anterior em centavos
                    null,                         // TODO: Considerar TransactionEntity do depósito.
                    UserItemEventType.PROVISIONED
                );

                // 6. Atualizar contadores e verificar se o depósito se esgotou
                remainingAmountInCentsToDistribute -= amountToAffectBalance;
                totalProvisionedAmountInCents += amountToAffectBalance;
                provisionedCount++;

                if (remainingAmountInCentsToDistribute <= 0) {
                    console.log(`INFO: All deposited amount (${totalAmountInCents / 100} R$) has been fully distributed. Stopping further provisions.`);
                    break; // Sai do loop, pois não há mais dinheiro para distribuir
                }

            } catch (error) {
                const errorMessage = `Failed to provision credits for UserItem ${userItem?.uuid?.uuid || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error(errorMessage, error);
                failedProvisions.push(errorMessage);
            }
        }

        // 7. Retornar um resumo detalhado da operação
        const finalResult = {
            totalDepositedAmountInReais: totalAmountInCents / 100,
            totalProvisionedAmountInReais: totalProvisionedAmountInCents / 100,
            remainingAmountInReais: remainingAmountInCentsToDistribute / 100,
            provisionedUserItemsCount: provisionedCount,
            failedProvisionsCount: failedProvisions.length,
            failedProvisionsDetails: failedProvisions.length > 0 ? failedProvisions : undefined
        };
        console.log("Credit release summary for employer", employerUuid, ":", JSON.stringify(finalResult, null, 2));
        return finalResult;
    }
}
import csv from 'csv-parser';
import { Readable } from 'stream';
import { CustomError } from '../../../../../errors/custom.error';
import { AppUserInfoRequest } from '../../../app-user-dto/app-user.dto';
import { IAppUserInfoRepository } from '../../../AppUserManagement/repositories/app-user-info.repository';
import { AppUserInfoCreateCommand, AppUserInfoEntity, AppUserInfoProps } from '../../../AppUserManagement/entities/app-user-info.entity';
import { ICompanyDataRepository } from '../../../../Company/CompanyData/repositories/company-data.repository';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { IAppUserAuthRepository } from '../../../AppUserManagement/repositories/app-use-auth-repository';
import { AppUserAuthSignUpEntity } from '../../../AppUserManagement/entities/app-user-auth.entity';

export class CreateAppUserByCorrectUsecaseTest {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private businessRepository: ICompanyDataRepository,
    private appUserAuthRepository: IAppUserAuthRepository
  ) { }

  async execute(fileBuffer: Buffer, business_info_uuid: string) {
    let validatedUser: AppUserInfoEntity[] = [];
    let errorUser: string[] = [];
    let usersRegistered: string[] = [];
    let associatedUsers: string[] = [];

    if (!business_info_uuid) throw new CustomError("Business Id is required", 400);

    const business = await this.businessRepository.findById(business_info_uuid);
    if (!business) throw new CustomError("Business not found", 404);
    if (business.status !== 'active') throw new CustomError("Business must be activated", 400);

    const users = await this.readCSV(fileBuffer);
    await this.validateUser(users, business_info_uuid, validatedUser, errorUser);
    await this.processUsers(validatedUser, business_info_uuid, usersRegistered, associatedUsers);

    return { usersRegistered, errorUser, associatedUsers };
  }

  private async readCSV(fileBuffer: Buffer): Promise<AppUserInfoRequest[]> {
    let usersFromCSV: AppUserInfoRequest[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());

      stream
        .pipe(csv({ separator: ',' }))
        .on('data', (data) => {
          try {
            if (data['\ufeffcodigo_interno'] && data['company_owner'] && data['nome_completo'] && data['sexo'] && data['rg'] && data['cpf'] && data['data_nascimento'] && data['estado_civil'] && data['total_dependentes'] && data['cargo'] && data['remuneracao']) {

              const internal_company_code = data['\ufeffcodigo_interno'];
              const company_owner = JSON.parse(data['company_owner']);
              const full_name = data['nome_completo'];
              const gender = data['sexo'];
              const document2 = data['rg'];
              const document = data['cpf'];
              const date_of_birth = data['data_nascimento'];
              const marital_status = data['estado_civil'];
              const dependents_quantity = +data['total_dependentes'];
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
                salary
              };

              usersFromCSV.push(userDataFromCSV);
            } else {
              throw new CustomError("Caiu aqui", 400);
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

  private async validateUser(users: AppUserInfoRequest[], business_info_uuid: string, validatedUser: AppUserInfoEntity[], errorUser: string[]) {
    for (const user of users) {
      const data: AppUserInfoCreateCommand = {
        business_info_uuid: new Uuid(business_info_uuid),
        address_uuid: null,
        document: user.document,
        document2: user.document2,
        document3: null,
        full_name: user.full_name,
        display_name: '',
        internal_company_code: user.internal_company_code,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        phone: null,
        email: null,
        salary: user.salary,
        company_owner: user.company_owner,
        status: 'pending',
        function: user.user_function,
        recommendation_code: null,
        is_authenticated: false,
        marital_status: user.marital_status,
        dependents_quantity: user.dependents_quantity,
        user_document_validation_uuid: null,
      };

      try {
        const appUser = await AppUserInfoEntity.create(data);
        validatedUser.push(appUser);
      } catch (error: any) {
        errorUser.push(`Erro ao criar usuário: ${user.document} - ${error}`);
      }
    }
  }

  private async processUsers(users: AppUserInfoEntity[], business_info_uuid: string, usersRegistered: string[], associatedUsers: string[]) {
    for (const user of users) {
      const existingUserInfo = await this.appUserInfoRepository.findByDocumentUserInfo(user.document);
      const findUserAuth = await this.appUserAuthRepository.findByDocument(user.document);
      if (existingUserInfo && (existingUserInfo?.business_info_uuid && existingUserInfo?.business_info_uuid?.uuid !== business_info_uuid)) {

        associatedUsers.push(existingUserInfo?.document);

      }else if (!existingUserInfo && !findUserAuth) {


        const userInfoentity = new AppUserInfoEntity(user);
        await this.appUserInfoRepository.saveOrUpdateByCSV(userInfoentity);
        usersRegistered.push(userInfoentity.document);

      } else if (findUserAuth && !existingUserInfo) {


        await this.appUserInfoRepository.createUserInfoandUpdateUserAuthByCSV(user);
        usersRegistered.push(user.document);

      } else if (existingUserInfo) {

        const userInfoentity = new AppUserInfoEntity(user);
        userInfoentity.changeBusinessInfoUuid(new Uuid(business_info_uuid));

        await this.appUserInfoRepository.saveOrUpdateByCSV(user);
        usersRegistered.push(user.document);

        if (findUserAuth) {


          const userAuthEntity = new AppUserAuthSignUpEntity(findUserAuth);
          userAuthEntity.changeUserInfo(existingUserInfo.uuid);
          await this.appUserAuthRepository.update(userAuthEntity);
        }
      }
    }
  }
}

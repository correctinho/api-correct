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

    if (!business_info_uuid) throw new CustomError("Business Id is required", 400);

    const business = await this.businessRepository.findById(business_info_uuid);
    if (!business) throw new CustomError("Business not found", 404);
    if (business.status !== 'active') throw new CustomError("Business must be activated", 400);

    const users = await this.readCSV(fileBuffer);
    await this.validateUser(users, business_info_uuid, validatedUser, errorUser);
    await this.processUsers(validatedUser, business_info_uuid, usersRegistered);

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

  private async processUsers(users: AppUserInfoEntity[], business_info_uuid: string, usersRegistered: string[]) {
    for (const user of users) {
      const existingUserInfo = await this.appUserInfoRepository.findByDocumentUserInfo(user.document);
      const findUserAuth = await this.appUserAuthRepository.findByDocument(user.document);

      const userInfoProps: AppUserInfoProps = {
        business_info_uuid: new Uuid(business_info_uuid),
        address_uuid: user.address_uuid,
        document: user.document,
        document2: user.document2,
        document3: user.document3,
        full_name: user.full_name,
        display_name: user.display_name,
        internal_company_code: user.internal_company_code,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        phone: user.phone,
        email: user.email,
        salary: user.salary,
        company_owner: user.company_owner,
        status: user.status,
        function: user.function,
        recommendation_code: user.recommendation_code,
        is_authenticated: user.is_authenticated,
        marital_status: user.marital_status,
        dependents_quantity: user.dependents_quantity,
        user_document_validation_uuid: user.user_document_validation_uuid,
      };

      if (existingUserInfo) {
        const isAlreadyAnEmployee = existingUserInfo.Employee.find(business => business.business_info_uuid === business_info_uuid);

        const userInfoEntity = new AppUserInfoEntity(userInfoProps);
        userInfoEntity.changeUuid(new Uuid(existingUserInfo.uuid))

        if (isAlreadyAnEmployee) {
          //In this situation, user already exists and is already an employee. So we must update employee info

          await this.appUserInfoRepository.updateEmployee(userInfoEntity, isAlreadyAnEmployee.uuid);
        } else {
          //Here we need to create an employee
          await this.appUserInfoRepository.createEmployee(userInfoEntity)
        }

        usersRegistered.push(userInfoEntity.document);
      }


      if (!existingUserInfo && !findUserAuth) {
        //Here, user does not exist in any of the registers, so we are going to create a new userinfo and employee

        const userInfoEntity = new AppUserInfoEntity(userInfoProps);
        await this.appUserInfoRepository.createUserInfoAndEmployee(userInfoEntity);
        usersRegistered.push(userInfoEntity.document);

      } else if (findUserAuth && !existingUserInfo) {
        //Here, we must create userInfo and connect to existing user auth and create an employee

        await this.appUserInfoRepository.createUserInfoandUpdateUserAuthByCSV(user);
        usersRegistered.push(user.document);

      }
      // else if (existingUserInfo) {
      //   console.log("5 ****************")

      //   const userInfoEntity = new AppUserInfoEntity(userInfoProps);
      //   userInfoEntity.changeUuid(new Uuid(existingUserInfo.uuid))
      //   userInfoEntity.addBusinessInfoUuid(new Uuid(business_info_uuid));
      //   await this.appUserInfoRepository.createUserInfoAndEmployee(userInfoEntity);
      //   usersRegistered.push(user.document);

      //   if (findUserAuth) {
      //     console.log("6 ****************")

      //     const userAuthEntity = new AppUserAuthSignUpEntity(findUserAuth);
      //     userAuthEntity.changeUserInfo(new Uuid(existingUserInfo.uuid));
      //     await this.appUserAuthRepository.update(userAuthEntity);
      //   }
      // }
    }
  }
}

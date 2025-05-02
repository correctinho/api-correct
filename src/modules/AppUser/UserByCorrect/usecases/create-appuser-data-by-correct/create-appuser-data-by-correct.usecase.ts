import csv from 'csv-parser';
import { Readable } from 'stream';
import { CustomError } from '../../../../../errors/custom.error';
import { AppUserInfoRequest } from '../../../app-user-dto/app-user.dto';
import { IAppUserInfoRepository } from '../../../AppUserManagement/repositories/app-user-info.repository';
import { AppUserInfoCreateCommand, AppUserInfoEntity, AppUserInfoProps } from '../../../AppUserManagement/entities/app-user-info.entity';
import { ICompanyDataRepository } from '../../../../Company/CompanyData/repositories/company-data.repository';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { IAppUserAuthRepository } from '../../../AppUserManagement/repositories/app-use-auth-repository';
import { IBusinessItemDetailsRepository } from '../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository';
import { OutputFindEmployerItemDetailsDTO } from '../../../../Company/BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto';
import { InputCreateAppUserDataByCorrectDTO } from './dto/-create-app-user-data-by-correct.dto';
import { AppUserItemEntity } from '../../../AppUserManagement/entities/app-user-item.entity';
import { UserItemStatus } from '@prisma/client';
import { BenefitGroupsEntity } from '../../../../Company/BenefitGroups/entities/benefit-groups.entity';
import { IAppUserItemRepository } from '../../../AppUserManagement/repositories/app-user-item-repository';
import { IBenefitsRepository } from '../../../../benefits/repositories/benefit.repository';

let employerActiveItems: OutputFindEmployerItemDetailsDTO[] = []

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
    let validatedUser: AppUserInfoEntity[] = [];
    let errorUser: string[] = [];
    let usersRegistered: string[] = [];

    if (!data.business_info_uuid) throw new CustomError("Business Id is required", 400);


    const business = await this.businessRepository.findById(data.business_info_uuid);
    if (!business) throw new CustomError("Business not found", 404);
    if (business.status !== 'active') throw new CustomError("Business must be activated", 400);

    //check if employer has registered items
    const employerItems = await this.employerItemsRepository.findAllEmployerItems(data.business_info_uuid)
    if (employerItems.length === 0) throw new CustomError("No items found for employer", 404)

    //It is possible there are not hired items => is_active === false. So we need to map active items
    await this.mapEmployerActiveItems(employerItems)
    if (employerActiveItems.length === 0) throw new CustomError("Employer has no active items", 404)

    const users = await this.readCSV(data.fileBuffer);
    await this.validateUser(users, data.business_info_uuid, validatedUser, errorUser);
    await this.processUsers(validatedUser, data.business_info_uuid, usersRegistered);

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
    //we need to get the benefit debit card to sabe to new users
    const benefit = await this.benefitsRepository.findByName("Correct")
    if (!benefit) throw new CustomError("Benefit not found", 404)
    //set debit benefit

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
        is_employee: true,
        debit_benefit_uuid: benefit.uuid
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

      let employeeItemsArray: AppUserItemEntity[] = [] // here are saved all items that must be saved for current employee
      let defaultGroup
      for (const employerItem of employerActiveItems) {
        //separate the default group that was previously created by correct
        const group = (employerItem.BenefitGroups.find(group => group.is_default === true))
        //for each employerItem, check if employee already has this item
        const employeeAlreadyHasItem = await this.employeeItemRepository.findItemByEmployeeAndBusiness(user.uuid.uuid, user.business_info_uuid.uuid, employerItem.item_uuid)
        if (employeeAlreadyHasItem) {
          const employeeAlreadyHasItemEntity = new AppUserItemEntity(employeeAlreadyHasItem)
          employeeAlreadyHasItemEntity.changeGroupUuid(new Uuid(group.uuid))

          employeeItemsArray.push(employeeAlreadyHasItem)
        }

        defaultGroup = {
          uuid: new Uuid(group.uuid),
          group_name: group.group_name,
          employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
          value: group.value,
          is_default: group.is_default,
          business_info_uuid: new Uuid(group.business_info_uuid),
          created_at: group.created_at
        }

        const employeeItemEntityData = {
          business_info_uuid: user.business_info_uuid,
          user_info_uuid: user.uuid,
          item_uuid: new Uuid(employerItem.item_uuid),
          img_url: employerItem.img_url,
          item_name: employerItem.Item.name,
          balance: defaultGroup.value,
          group_uuid: new Uuid(group.uuid),
          status: 'inactive' as UserItemStatus
        }

        const employeeItemEntity = AppUserItemEntity.create(employeeItemEntityData)
        employeeItemsArray.push(employeeItemEntity)
      }


      if (existingUserInfo) {
        user.changeUuid(new Uuid(existingUserInfo.uuid))

        for (const employeeItem of employeeItemsArray) {
          employeeItem.changeUserInfoUuid(new Uuid(existingUserInfo.uuid))
        }

        //if user exists, we need to set that he is an employee
        // also set a group for each item
        await this.appUserInfoRepository.saveOrUpdateByCSV(user, employeeItemsArray)

        //now we need to know if current user is already an employee
        const isAlreadyAnEmployee = existingUserInfo.Employee.find(business => business.business_info_uuid === business_info_uuid);

        if (isAlreadyAnEmployee) {
          //In this situation, user already exists and is already an employee. So we must update employee info
          //this is also going to create or update user items
          await this.appUserInfoRepository.updateEmployeeByCSV(user, isAlreadyAnEmployee, employeeItemsArray);
        } else {
          //Here we need to create an employee
          //Also create or update userItems
          await this.appUserInfoRepository.createEmployeeAndItems(user, employeeItemsArray)
        }

        usersRegistered.push(user.document);
      }

      if (!existingUserInfo && !findUserAuth) {
        //Here, user does not exist in any of the registers, so we are going to create a new userinfo and employee
        await this.appUserInfoRepository.createUserInfoAndEmployee(user, employeeItemsArray);
        usersRegistered.push(user.document);

      } else if (findUserAuth && !existingUserInfo) {

        //Here, we must create userInfo and connect to existing user auth and create an employee
        await this.appUserInfoRepository.createUserInfoandUpdateUserAuthByCSV(user, employeeItemsArray);
        usersRegistered.push(user.document);

      }

    }
  }

  private async mapEmployerActiveItems(employerItems: OutputFindEmployerItemDetailsDTO[]) {
    for (const item of employerItems) {
      if (item.is_active) {
        employerActiveItems.push(item)
      }
    }
  }
}

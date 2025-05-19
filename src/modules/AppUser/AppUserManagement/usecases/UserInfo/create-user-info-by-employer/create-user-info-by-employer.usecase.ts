import { UserItemStatus } from "@prisma/client";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "../../../../../Company/BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto";
import { AppUserAuthSignUpEntity } from "../../../entities/app-user-auth.entity";
import { AppUserInfoEntity, AppUserInfoProps } from "../../../entities/app-user-info.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { InputCreateUserInfoDTO, OutputCreateUserInfoDTO } from "../create-user-info/dto/create-user-info.dto";
import { AppUserItemEntity } from "../../../entities/app-user-item.entity";
import { BenefitGroupsEntity } from "../../../../../Company/BenefitGroups/entities/benefit-groups.entity";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";

let employerActiveItems: OutputFindEmployerItemDetailsDTO[] = []

export class CreateAppUserInfoByEmployerUsecase {
  constructor(
    private appUserInfoRepository: IAppUserInfoRepository,
    private appUserAuthRepository: IAppUserAuthRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository,
    private benefitsRepository: IBenefitsRepository


  ) { }

  async execute(data: InputCreateUserInfoDTO): Promise<OutputCreateUserInfoDTO> {
    if (!data.document) throw new CustomError("Document is required", 400)
    const userInfoEntity = await AppUserInfoEntity.create(data)
    userInfoEntity.setEmployee()
    //check if document is already registered
    const existingUserInfo = await this.appUserInfoRepository.findByDocumentUserInfo(userInfoEntity.document)
    const findUserAuth = await this.appUserAuthRepository.findByDocument(userInfoEntity.document);

    const isEmployee = existingUserInfo?.Employee.find(business => business.business_info_uuid === data.business_info_uuid.uuid)
    if (existingUserInfo && isEmployee) throw new CustomError("User with this document already exists for the provided business", 409);

    //check if employer has registered items
    const employerItems = await this.employerItemsRepository.findAllEmployerItems(userInfoEntity.business_info_uuid.uuid)
    if (employerItems.length === 0) throw new CustomError("No items found for employer", 404)

    //get debit benefit
    const benefit = await this.benefitsRepository.findByName("Correct")
    if (!benefit) throw new CustomError("Benefit not found", 404)
    //set debit benefit
    userInfoEntity.setDebitBenefitUuid(benefit.uuid)

    let employeeItemsArray: AppUserItemEntity[] = []

    await this.mapEmployerActiveItems(employerItems)

    for (const employerItem of employerActiveItems) {
      const group = (employerItem.BenefitGroups.find(group => group.is_default === true))

      const employeeItemEntityData = {
        uuid: new Uuid(),
        user_info_uuid: userInfoEntity.uuid,
        business_info_uuid: userInfoEntity.business_info_uuid,
        item_uuid: new Uuid(employerItem.item_uuid),
        item_name: employerItem.Item.name,
        img_url: employerItem.img_url,
        balance: group.value,
        group_uuid: new Uuid(group.uuid),
        status: 'inactive' as UserItemStatus
      }

      const employeeItemEntity = AppUserItemEntity.create(employeeItemEntityData)

      employeeItemsArray.push(employeeItemEntity)
    }

    if (existingUserInfo) {
      for (const employeeItem of employeeItemsArray) {
        employeeItem.changeUserInfoUuid(new Uuid(existingUserInfo.uuid))
      }
    }
    if (existingUserInfo && !isEmployee) {
      userInfoEntity.changeUuid(new Uuid(existingUserInfo.uuid))

      //create only employee data
      await this.appUserInfoRepository.createEmployeeAndItems(userInfoEntity, employeeItemsArray)
    }

    if (!existingUserInfo && !findUserAuth) {
      await this.appUserInfoRepository.createUserInfoAndEmployee(userInfoEntity, employeeItemsArray);
    }

    if (findUserAuth && !existingUserInfo) await this.appUserInfoRepository.createUserInfoandUpdateUserAuthByCSV(userInfoEntity, employeeItemsArray);

    await this.appUserInfoRepository.createOrUpdateUserInfoByEmployer(userInfoEntity)

    return {}


  }

  private async mapEmployerActiveItems(employerItems: OutputFindEmployerItemDetailsDTO[]) {
    for (const item of employerItems) {
      if (item.is_active) {
        employerActiveItems.push(item)
      }
    }
  }
}

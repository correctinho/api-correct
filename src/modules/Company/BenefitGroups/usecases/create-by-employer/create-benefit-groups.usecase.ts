import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { BenefitGroupsCreateCommand, BenefitGroupsEntity } from "../../entities/benefit-groups.entity";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { InputCreateBenefitGroupsDTO } from "./dto/create-benefit-groups.dto"
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";

let employeesUuids: string[] = []
let employerItems: string[] = []

export class CreateBenefitGroupsUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository
  ) { }

  async execute(data: InputCreateBenefitGroupsDTO) {

    const groupEntity: BenefitGroupsCreateCommand = {
      group_name: data.group_name,
      employer_item_details_uuid: new Uuid(data.employer_item_details_uuid),
      value: data.value,
      is_default: false,
      business_info_uuid: new Uuid(data.business_info_uuid)
    }
    const entity = BenefitGroupsEntity.create(groupEntity)

    const createGroup = await this.benefitGroupsRepository.createReturn(entity)

    return {
      uuid: createGroup.uuid.uuid,
      group_name: createGroup.group_name,
      employerItemDetails_uuid: createGroup.employer_item_details_uuid.uuid,
      value: createGroup.value,
      business_info_uuid: createGroup.business_info_uuid.uuid,
      is_default: createGroup.is_default,
      created_at: createGroup.created_at
    }
  }


}

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { BenefitGroupsEntity } from "../../entities/benefit-groups.entity";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { InputUpdateBenefitGroupsDTO, OutputUpdateBenefitGroupsDTO } from "./dto/update-benefit-groups.dto"
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";


export class UpdateBenefitGroupsUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository
  ) { }

  async execute(data: InputUpdateBenefitGroupsDTO): Promise<OutputUpdateBenefitGroupsDTO> {
    if(!data.uuid) throw new CustomError("Group uuid is required", 400)

    //find group by id
    const group = await this.benefitGroupsRepository.find(new Uuid(data.uuid))
    if(!group) throw new CustomError("Group not found", 404)

    //check if group belongs to admin
    if(group.business_info_uuid.uuid !== data.business_info_uuid) throw new CustomError("Unauthorized access", 403)

    const entity = new BenefitGroupsEntity(group)
    entity.changeGroupName(data.group_name)
    entity.changeValue(data.value)


    //update group
    const updateGroup = await this.benefitGroupsRepository.createOrUpdate(entity)

    return {
      uuid: updateGroup.uuid.uuid,
      group_name: updateGroup.group_name,
      employerItemDetails_uuid: updateGroup.employer_item_details_uuid.uuid,
      value: updateGroup.value,
      business_info_uuid: updateGroup.business_info_uuid.uuid,
      created_at: updateGroup.created_at,
      updated_at: updateGroup.updated_at
    }
  }


}

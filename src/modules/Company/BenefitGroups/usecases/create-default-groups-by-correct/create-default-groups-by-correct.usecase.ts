import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { BenefitGroupsEntity } from "../../entities/benefit-groups.entity";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { InputCreateBenefitGroupsByCorrectDTO } from "./dto/create-benefit-groups-by-correct.dto";

export class CreateBenefitGroupsByCorrectUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private userInfoRepository: IAppUserInfoRepository,
    private employerItemsRepository: IBusinessItemDetailsRepository
  ) { }

  async execute(data: InputCreateBenefitGroupsByCorrectDTO) {
    //find employer items
    const employerItems = await this.employerItemsRepository.findAllEmployerItems(data.business_info_uuid)
    if(employerItems.length === 0) throw new CustomError("Employer items not found", 404)

    for (const employerItem of employerItems){
      //create default group for each employeer item
      const dataEntity = {
        group_name: data.group_name,
        employer_item_details_uuid: new Uuid(employerItem.uuid),
        value: data.value,
        employee_uuid: data.employee_uuid ? new Uuid(data.employee_uuid) : null,
        business_info_uuid: new Uuid(data.business_info_uuid)
      }

      const groupEntity = BenefitGroupsEntity.create(dataEntity)
    }
  }

}

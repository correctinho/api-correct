import { find } from "lodash";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { AppUserInfoEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "../../../BusinessItemsDetails/usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { OutputGetOneBenefitGroupsDTO } from "./dto/get-one-by-employer.dto";


export class GetOneBenefitGroupsByEmployerUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
  ) { }

  async execute(uuid: string, business_info_uuid: string): Promise<OutputGetOneBenefitGroupsDTO> {
    if (!uuid) throw new CustomError("Uuid is required", 400)

    //find all
    const findOne = await this.benefitGroupsRepository.find(new Uuid(uuid))
    if (!findOne) throw new CustomError("Group not found", 404);

    if (findOne.business_info_uuid.uuid !== business_info_uuid) throw new CustomError("Unauthorized access", 403)

    return {
      uuid: findOne.uuid.uuid,
      group_name: findOne.group_name,
      employer_item_details_uuid: findOne.employer_item_details_uuid.uuid,
      value: findOne.value / 100,
      business_info_uuid: findOne.business_info_uuid.uuid,
      is_default: findOne.is_default,
      created_at: findOne.created_at,
      updated_at: findOne.updated_at
    };

  }


}

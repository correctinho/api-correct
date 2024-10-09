import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { OutputGetAllBenefitGroupsDTO } from "./dto/get-all-by-employer.dto";

export class GetAllBenefitGroupsByEmployerUsecase {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
  ){}

  async execute(business_info_uuid: string): Promise<OutputGetAllBenefitGroupsDTO[] | []>{
    //find all
    const findAll = await this.benefitGroupsRepository.findAllByBusiness(business_info_uuid)
    if(findAll.length === 0) return []

    return findAll.map((item) => {
      return {
        uuid: item.uuid.uuid,
        group_name: item.group_name,
        employerItemDetails_uuids:item.employerItemDetails_uuids,
        value: item.value / 100,
        user_info_uuids: item.user_info_uuids,
        business_info_uuid: item.business_info_uuid.uuid,
        created_at: item.created_at
      }
    })
  }
}

import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { BusinessItemsDetailsEntity } from "../../../Company/BusinessItemsDetails/entities/businessItemDetails.entity";
import { ICompanyDataRepository } from "../../../Company/CompanyData/repositories/company-data.repository";
import { BenefitsEntity } from "../../entities/benefit.entity";
import { IBenefitsRepository } from "../../repositories/benefit.repository";
import { InputCreateCustomizedBenefitDto, OutputCreateCustomizedBenefitDto } from "./dto/create-customized-benefit.dto";

export class CreateCustomizedBenefitUsecase {
  constructor(
    private benefitsRepository: IBenefitsRepository,
    private businessInfoRepository: ICompanyDataRepository
  ) { }

  async execute(input: InputCreateCustomizedBenefitDto): Promise<OutputCreateCustomizedBenefitDto> {
    if (!input.business_info_uuid) throw new CustomError("Business id is required", 400)
    if (input.cycle_end_day === 0 || !input.cycle_end_day) throw new CustomError("Cycle end day is required", 400)
    if (!input.description) throw new CustomError("Description is required", 400);


    //check if business exists
    const business = await this.businessInfoRepository.findById(input.business_info_uuid)
    if (!business) throw new CustomError("Business not found", 404)

    const benefitEntityData = {
      name: input.name,
      description: input.description,
      item_type: input.item_type,
      item_category: input.item_category,
      parent_uuid: input.parent_uuid ? new Uuid(input.parent_uuid) : null,
      business_info_uuid: new Uuid(business.uuid)
    }
    const benefit = BenefitsEntity.create(benefitEntityData)

    const itemDetailsEntityData = {
      item_uuid: benefit.uuid,
      business_info_uuid: benefit.business_info_uuid,
      cycle_end_day: input.cycle_end_day,
      cycle_start_day: input.cycle_end_day + 1
    }

    //check if business custom benefit already exists
    const findCustomItem = await this.benefitsRepository.findByBusiness(benefit.business_info_uuid.uuid, benefit.name)
    if (findCustomItem) throw new CustomError("Business already has this custom item", 409)

    const itemDetails = BusinessItemsDetailsEntity.create(itemDetailsEntityData)

    await this.benefitsRepository.createCustomBenefit(benefit, itemDetails)


    return {
      uuid: benefit.uuid.uuid,
      name: benefit.name,
      description: benefit.description,
      item_type: benefit.item_type,
      item_category: benefit.item_category,
      parent_uuid: benefit.parent_uuid ? benefit.parent_uuid.uuid : null,
      business_info_uuid: benefit.business_info_uuid ? benefit.business_info_uuid.uuid : null,
      cycle_start_day: itemDetails.cycle_start_day,
      cycle_end_day: itemDetails.cycle_end_day
    }

  }
}

import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { BusinessItemsDetailsEntity } from "../../../entities/businessItemDetails.entity";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { InputCreateItemByCorrectDTO, OutputCreateItemByCorrectDTO } from "./dto/create-item-by-correct.dto";

export class CreateEmployerItemByCorrectUsecase {
  constructor(
    private itemDetailsRepository: IBusinessItemDetailsRepository,
    private benefitsRepository: IBenefitsRepository,
    private businessRepository: ICompanyDataRepository
  ) { }

  async execute(data: InputCreateItemByCorrectDTO): Promise<OutputCreateItemByCorrectDTO> {
    if (!data.cycle_end_day || data.cycle_end_day === 0) throw new CustomError("Cycle end day is required", 400);
    data.cycle_start_day = data.cycle_end_day + 1

    const entityData = {
      item_uuid: new Uuid(data.item_uuid),
      business_info_uuid: new Uuid(data.business_info_uuid),
      cycle_start_day: data.cycle_start_day,
      cycle_end_day: data.cycle_end_day
    }

    const itemDetailsEntity = BusinessItemsDetailsEntity.create(entityData)

    //check if item exists
    const findItem = await this.benefitsRepository.find(itemDetailsEntity.item_uuid)
    if (!findItem) throw new CustomError("Item not found", 404)

    //check if business exists
    const findBusiness = await this.businessRepository.findById(itemDetailsEntity.business_info_uuid.uuid)
    if (!findBusiness) throw new CustomError("Business not found", 404)

    //check if business already have item
    const findBusinessItem = await this.itemDetailsRepository.findByItemUuidAndBusinessInfo(findBusiness?.uuid, findItem?.uuid.uuid)
    if (findBusinessItem) throw new CustomError("Business Already has this item", 409);

    //create item
    await this.itemDetailsRepository.create(itemDetailsEntity)

    return {
      uuid: itemDetailsEntity.uuid.uuid,
      item_uuid: itemDetailsEntity.item_uuid.uuid,
      business_info_uuid: itemDetailsEntity.business_info_uuid.uuid,
      cycle_start_day: itemDetailsEntity.cycle_start_day,
      cycle_end_day: itemDetailsEntity.cycle_end_day,
      created_at: itemDetailsEntity.created_at,

    }
  }
}

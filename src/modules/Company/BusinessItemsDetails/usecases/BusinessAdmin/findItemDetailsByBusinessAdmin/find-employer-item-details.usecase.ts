import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "./dto/find-employer-item.dto";

export class FindEmployerItemDetailsUsecase {
  constructor(
    private itemDetailsRepository: IBusinessItemDetailsRepository,
    private itemsRepository: IBenefitsRepository
  ) { }

  async execute(id: string, business_info_uuid: string): Promise<OutputFindEmployerItemDetailsDTO> {
    if (!id) throw new CustomError("Id is required", 400)
    const itemDetails = await this.itemDetailsRepository.find(new Uuid(id))

    if (!itemDetails) throw new CustomError("Item details not found", 404);
    if(itemDetails.business_info_uuid.uuid !== business_info_uuid) throw new CustomError("Unauthorized acess", 403)
    //find related item
    const relatedItem = await this.itemsRepository.find(itemDetails.item_uuid)
    if(!relatedItem) throw new CustomError("Item does not exist", 404)

    const metrics = await this.itemDetailsRepository.getMetrics(
        business_info_uuid, 
        itemDetails.item_uuid.uuid
    );
    
      
    return {
      uuid: itemDetails.uuid.uuid,
      item_name: relatedItem.name,
      item_type: relatedItem.item_type,
      item_uuid: itemDetails.item_uuid.uuid,
      business_info_uuid: itemDetails.business_info_uuid.uuid,
      is_active: itemDetails.is_active,
      cycle_start_day: itemDetails.cycle_start_day,
      cycle_end_day: itemDetails.cycle_end_day,
      total_lives: metrics.total_lives,
      estimated_cost: metrics.estimated_cost / 100,
      item_description: relatedItem.description,
      item_category: relatedItem.item_category,
      created_at: itemDetails.created_at,
      updated_at: itemDetails.updated_at
    }

  }
}

import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "./dto/find-employer-item.dto";

export class FindEmployerItemDetailsUsecase {
  constructor(private itemDetailsRepository: IBusinessItemDetailsRepository) { }

  async execute(id: string, business_info_uuid: string): Promise<OutputFindEmployerItemDetailsDTO> {
    if (!id) throw new CustomError("Id is required", 400)
    const itemDetails = await this.itemDetailsRepository.find(new Uuid(id))

    if (!itemDetails) throw new CustomError("Item details not found", 404);
    if(itemDetails.business_info_uuid.uuid !== business_info_uuid) throw new CustomError("Unauthorized acess", 403)

    return {
      uuid: itemDetails.uuid.uuid,
      item_uuid: itemDetails.item_uuid.uuid,
      business_info_uuid: itemDetails.business_info_uuid.uuid,
      cycle_start_day: itemDetails.cycle_start_day,
      cycle_end_day: itemDetails.cycle_end_day,
      created_at: itemDetails.created_at,
      updated_at: itemDetails.updated_at
    }

  }
}

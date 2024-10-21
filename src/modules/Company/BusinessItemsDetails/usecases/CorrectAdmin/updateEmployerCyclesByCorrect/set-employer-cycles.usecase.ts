import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { BusinessItemDetailsCreateCommand, BusinessItemsDetailsEntity } from "../../../entities/businessItemDetails.entity";
import { IBusinessItemDetailsRepository } from "../../../repositories/business-item-details.repository";
import { InputSetEmployerCyclesDTO, OutputSetEmployerCyclesDTO } from "./dto/set-cycles.dto";

export class SetEmployerCycleUsecase {
  constructor(
    private itemDetailsRepository: IBusinessItemDetailsRepository,
  ) { }

  async execute(data: InputSetEmployerCyclesDTO): Promise<OutputSetEmployerCyclesDTO> {
    if (!data.business_info_uuid) throw new CustomError("Business Id is required", 400);
    if (!data.item_uuid) throw new CustomError("Item Id is required", 400);
    if (!data.cycle_end_day || data.cycle_end_day === 0) throw new CustomError("Cycle end day is required", 400);

    //find item details
    const itemDetails = await this.itemDetailsRepository.findByItemUuidAndBusinessInfo(data.business_info_uuid, data.item_uuid)
    if (!itemDetails) throw new CustomError("Item not found", 404)

    const businessItemDetailsData = {
      uuid: new Uuid(itemDetails.uuid),
      item_uuid: new Uuid(itemDetails.item_uuid),
      business_info_uuid: new Uuid(itemDetails.business_info_uuid),
      is_active: itemDetails.is_active,
      cycle_start_day: itemDetails.cycle_start_day,
      cycle_end_day: itemDetails.cycle_end_day
    }

    const itemEntity = new BusinessItemsDetailsEntity(businessItemDetailsData)
    itemEntity.changeCycleEndDay(data.cycle_end_day)

    await this.itemDetailsRepository.update(itemEntity)

    return {
      uuid: itemEntity.uuid.uuid,
      item_uuid: itemEntity.item_uuid.uuid,
      business_info_uuid: itemEntity.business_info_uuid.uuid,
      cycle_start_day: itemEntity.cycle_start_day,
      cycle_end_day: itemEntity.cycle_end_day,
      created_at: itemEntity.created_at,
      updated_at: itemEntity.updated_at
    }
  }
}

import { CustomError } from "../../../../../errors/custom.error";
import { BusinessItemsDetailsEntity } from "../../entities/businessItemDetails.entity";
import { IBusinessItemDetailsRepository } from "../../repositories/business-item-details.repository";
import { OutputFindEmployerItemDetailsDTO } from "./dto/find-employer-item.dto";

export class FindAllEmployerItemDetailsUsecase {
  constructor(private itemDetailsRepository: IBusinessItemDetailsRepository) { }

  async execute(id: string): Promise<OutputFindEmployerItemDetailsDTO[]> {
    if (!id) throw new CustomError("Id is required", 400)

    const itemDetails = await this.itemDetailsRepository.findAllEmployerItems(id)

    // Mapear os detalhes dos itens para o formato esperado
    const output: OutputFindEmployerItemDetailsDTO[] = itemDetails.map(item => ({
      uuid: item.uuid,
      item_uuid: item.item_uuid,
      business_info_uuid: item.business_info_uuid,
      cycle_start_day: item.cycle_start_day,
      cycle_end_day: item.cycle_end_day,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
    return output;

  }

}
// class OutputMapper {
//   static toOutput(itemsDetails: OutputFindEmployerItemDetailsDTO[]): OutputFindEmployerItemDetailsDTO{
//       return{
//           employer_item_details: itemsDetails?.map((item) => ({
//               uuid: item.uuid.uuid,
//               item_uuid: item.item_uuid.uuid,
//               business_info_uuid: item.business_info_uuid.uuid,
//               cycle_start_day: item.cycle_start_day,
//               cycle_end_day: item.cycle_end_day,
//               created_at: item.created_at,
//               updated_at: item.updated_at
//           }))
//       }
//   }
// }

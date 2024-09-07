import { Uuid } from "../../../../../../../@shared/ValueObjects/uuid.vo"

export interface OutputFindEmployerItemDetailsDTO {
  uuid: string
  item_uuid: string
  business_info_uuid: string
  cycle_start_day:number
  cycle_end_day: number
  created_at: string
  updated_at: string,
  Item: {
    uuid: string
    name: string,
    description: string,
    item_type: string,
    item_category: string,
    parent_uuid: string | null,
    business_info_uuid: string | null,
  }
}

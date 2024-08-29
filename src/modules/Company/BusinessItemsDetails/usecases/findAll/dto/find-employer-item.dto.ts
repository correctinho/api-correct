import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo"

export interface OutputFindEmployerItemDetailsDTO {
  uuid: Uuid
  item_uuid: Uuid
  business_info_uuid: Uuid
  cycle_start_day:number
  cycle_end_day: number
  created_at: string
  updated_at: string
}

import { string } from "zod"

export interface OutputFindEmployerItemDetailsDTO {
  uuid: string
  item_name: string
  item_type: string
  item_uuid: string
  business_info_uuid: string
  cycle_start_day: number
  cycle_end_day: number
  created_at: string
  updated_at: string
}

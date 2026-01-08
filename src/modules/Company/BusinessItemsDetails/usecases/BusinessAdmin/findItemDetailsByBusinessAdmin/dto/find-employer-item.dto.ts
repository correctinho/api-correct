import { string } from "zod"

export interface OutputFindEmployerItemDetailsDTO {
  uuid: string
  item_name: string
  item_type: string
  item_uuid: string
  business_info_uuid: string
  is_active: boolean
  cycle_start_day: number
  cycle_end_day: number
  total_lives: number
  estimated_cost: number
  item_description?: string
  item_category?: string
  created_at: string
  updated_at: string
}

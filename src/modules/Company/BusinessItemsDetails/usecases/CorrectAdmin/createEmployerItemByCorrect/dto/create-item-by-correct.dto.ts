import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo"

export interface InputCreateItemByCorrectDTO {
  item_uuid: string
  business_info_uuid: string
  cycle_start_day?: number
  cycle_end_day: number
  created_at?: string
  updated_at?: string
}

export interface OutputCreateItemByCorrectDTO {
  uuid: string
  item_uuid: string
  business_info_uuid: string
  cycle_start_day: number
  cycle_end_day: number
  created_at?: string
  updated_at?: string
}

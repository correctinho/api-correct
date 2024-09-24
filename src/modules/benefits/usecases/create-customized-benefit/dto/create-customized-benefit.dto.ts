import { ItemCategory, ItemType } from "../../create-benefit/create-benefit.dto"

export interface InputCreateCustomizedBenefitDto {
  name: string
  description: string
  item_type: ItemType
  item_category: ItemCategory
  parent_uuid?: string | null
  business_info_uuid: string

  cycle_end_day: number
}

export interface OutputCreateCustomizedBenefitDto {
  uuid: string
  name: string
  description: string
  item_type: ItemType
  item_category: ItemCategory
  parent_uuid: string | null
  business_info_uuid: string
  cycle_start_day: number,
  cycle_end_day: number
}

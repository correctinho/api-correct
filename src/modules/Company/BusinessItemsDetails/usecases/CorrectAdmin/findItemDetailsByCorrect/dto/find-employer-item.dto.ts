import { string } from "zod"

export interface OutputFindEmployerItemDetailsDTO {
  uuid: string
  item_uuid: string
  img_url: string | null
  business_info_uuid: string
  balance: number
  cycle_start_day:number
  cycle_end_day: number
  is_active: boolean
  created_at: string
  updated_at: string
  Item: {
    uuid: string,
    name: string,
    item_type: string,
    item_category: string,
    parent_uuid: string,
    business_info_uuid: string
  },
  BenefitGroups: [
    {
      uuid: string,
      group_name: string,
      is_default: boolean
      employer_item_details_uuid: string
      value: number
      business_info_uuid: string,
      created_at: string
    }
  ]
}

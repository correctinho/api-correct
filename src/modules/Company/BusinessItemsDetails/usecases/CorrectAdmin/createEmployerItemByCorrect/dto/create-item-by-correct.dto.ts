export interface InputCreateItemByCorrectDTO {
  item_uuid: string
  business_info_uuid: string
  cycle_start_day?: number
  cycle_end_day: number
  default_group_name: string
  default_group_value: number
  created_at?: string
  updated_at?: string
}

export interface InputCreateItemAndGroupByCorrectDTO {

  item_uuid: string,
  business_info_uuid: string,
  cycle_end_day: number,
  value: number,

}

export interface OutputCreateItemAndGroupByCorrectDTO {
  employerItem: {
    uuid: string,
    item_uuid: string,
    business_info_uuid: string,
    cycle_end_day: number,
    cycle_start_day: number,
    is_active: boolean,
    created_at: string,
    updated_at: string
  },
  defaultGroup: {
    uuid: string,
    group_name: string,
    employer_item_details_uuid: string,
    value: number,
    business_info_uuid: string,
    is_default: string,
    created_at: string,
    updated_at: string
  }
}

export type InputCreateBenefitGroupByCorrectDTO = {
  uuid?: string
  group_name: string
  employer_item_details_uuid: string
  employee_uuid: string
  value: number
  business_info_uuid: string
  is_default: boolean
}

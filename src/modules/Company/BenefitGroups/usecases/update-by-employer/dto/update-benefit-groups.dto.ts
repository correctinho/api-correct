import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo"

export type InputUpdateBenefitGroupsDTO = {
  uuid: string
  group_name: string
  employer_item_details_uuid: string
  value: number
  business_info_uuid: string
}


export type OutputUpdateBenefitGroupsDTO = {
  uuid: string
  group_name: string
  employerItemDetails_uuid: string
  value: number
  business_info_uuid: string
  created_at: string
  updated_at: string
}

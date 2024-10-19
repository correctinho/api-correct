import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo"

export type InputCreateBenefitGroupsDTO = {
  uuid?: string
  group_name: string
  employer_item_details_uuid: string
  value: number
  user_info_uuids: string
  business_info_uuid: Uuid
}


export type OutputCreateBenefitGroupsDTO = {
  uuid: string
  group_name: string
  employerItemDetails_uuids: string[]
  value: number
  user_info_uuids: string[]
  business_info_uuid: string
  created_at: string
}

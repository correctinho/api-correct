import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo"

export type InputCreateBenefitGroupsByCorrectDTO = {
  uuid?: string
  group_name: string
  employer_item_details_uuid: string
  employee_uuid: string
  value: number
  business_info_uuid: string
  employees_list_uuid: string[]
}


export type OutputCreateBenefitGroupsByCorrectDTO = {
  uuid: string
  group_name: string
  employerItemDetails_uuids: string
  value: number
  user_info_uuids: string
  business_info_uuid: string
  created_at: string
}

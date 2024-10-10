import { Status, UserDocumentValidationStatus } from "@prisma/client"
import { Uuid } from "../../../../../../../@shared/ValueObjects/uuid.vo"

export interface InputFindUserByUserDTO {
  document: string
}

export interface OutputFindUserByUserDTO {
  uuid: string
  address_uuid: string | null
  document: string
  document2: string | null
  document3: string | null
  full_name: string
  display_name: string | null
  internal_company_code: string | null
  gender: string | null
  email: string | null
  date_of_birth: string
  phone: string | null
  salary: number | null
  company_owner: boolean
  status: Status
  function: string | null
  recommendation_code: string | null
  marital_status: string | null
  dependents_quantity: number
  created_at: string | null
  updated_at: string | null
  BusinessInfoList: {
    uuid: string,
    fantasy_name: string
  }[] | []


}

export interface OutputFindUserDTO {
  uuid: string
  address_uuid: string | null
  document: string
  document2: string | null
  document3: string | null
  full_name: string
  display_name: string | null
  gender: string | null
  email: string | null
  date_of_birth: string
  phone: string | null
  status: Status
  recommendation_code: string | null
  marital_status: string | null
  is_employee?: boolean
  user_document_validation_uuid?: string
  created_at: string | null
  updated_at: string | null
  Employee: {
    uuid: string
    business_info_uuid: string
    internal_company_code: string | null
    salary: number | null
    company_owner: boolean
    function: string | null
    dependents_quantity: number
    created_at: string | null
    updated_at: string | null
  }[] | []

}

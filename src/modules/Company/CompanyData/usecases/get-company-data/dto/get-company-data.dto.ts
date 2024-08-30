import { BusinessStatus, BusinessTypeOptions } from "@prisma/client"

export type OutputGetCompanyDataDTO = {
  uuid: string
  address_uuid: string
  fantasy_name: string
  corporate_reason: string | null
  document: string
  classification: string
  colaborators_number: number
  status: BusinessStatus
  phone_1: string
  phone_2: string | null
  email: string
  business_type: BusinessTypeOptions
  branches_uuid?: string[]
  employer_branch?: string | null
  items_uuid?: string[]
  created_at: string
  updated_at: string
  Address: {
    uuid: string
    line1: string
    line2: string
    line3: string | null
    neighborhood: string
    postal_code: string
    city: string
    state: string
    country: string
    created_at: string
    updated_at: string

  }

}

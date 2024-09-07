import { BusinessStatus, BusinessTypeOptions } from "@prisma/client"

export interface InputBusinessFirstRegisterDTO {
  line1: string
  line2: string
  line3: string | null
  postal_code: string
  neighborhood: string
  city: string
  state: string
  country: string
  address_fk_uuid: string
  fantasy_name: string
  corporate_reason: string | null
  document: string
  classification: string
  colaborators_number: number
  status: BusinessStatus
  phone_1: string
  phone_2: string | null
  business_type: BusinessTypeOptions
  email: string
  branches_uuid: string[]
}

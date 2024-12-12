import { BusinessStatus, BusinessTypeOptions } from "@prisma/client"

export type InputGetRegisteredBusinessBySeller = {
  uuid: string
  isAdmin: boolean
  business_document: string
}

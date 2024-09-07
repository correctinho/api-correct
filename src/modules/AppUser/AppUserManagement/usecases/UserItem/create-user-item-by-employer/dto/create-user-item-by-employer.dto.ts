import { UserItemStatus } from "@prisma/client"

export type InputCreateAppUserItemByEmployerDTO = {
  user_info_uuid: string
  item_uuid: string
  item_name?: string
  balance: number
  status: UserItemStatus
  business_info_uuid: string
}

export type OutputCreateappUserItemByEmployerDTO = {
  uuid: string
  user_info_uuid: string
  item_uuid: string
  item_name: string
  balance: number
  status: UserItemStatus,
  business_info_uuid: string
  created_at: string
}

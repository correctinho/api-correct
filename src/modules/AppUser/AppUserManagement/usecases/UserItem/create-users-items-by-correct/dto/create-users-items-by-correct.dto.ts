import { UserItemStatus } from "@prisma/client"

export type InputCreateAppUserItemByCorrectDTO = {
  user_info_uuid: string
  item_uuid: string
  item_name?: string
  balance: number
  status: UserItemStatus
  business_info_uuid: string
}

export type OutputCreateappUserItemByCorrectDTO = {
  uuid: string
  user_info_uuid: string
  item_uuid: string
  item_name: string
  balance: number
  status: UserItemStatus,
  business_info_uuid: string
  created_at: string
}

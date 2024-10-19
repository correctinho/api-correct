import { UserItemStatus } from "@prisma/client"

export type InputActivateUserItemByEmployer = {
  business_info_uuid: string,
  user_info_uuid: string
  item_uuid: string
  balance: number
  group_uuid: string
}

export type OutputActivateUserItemByEmployer = {
  uuid: string
  user_info_uuid: string
  business_info_uuid: string
  item_uuid: string
  item_name?: string
  balance: number
  status: UserItemStatus
  created_at?: string | null
  updated_at?: string | null
}

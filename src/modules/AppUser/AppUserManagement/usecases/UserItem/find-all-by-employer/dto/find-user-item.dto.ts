import { UserItemStatus } from "@prisma/client"


export type OutputFindAllAppUserItemsDTO = {
  uuid: string
  user_info_uuid: string
  item_uuid: string
  img_url?: string
  item_name: string
  item_type: string
  item_category: string
  balance: number
  status: UserItemStatus,
  created_at: string,
  Provider: {
    business_info_uuid: string
    fantasy_name: string
  },
  Group: {
    group_uuid: string,
    group_name: string,
    group_value: number,
    group_is_default: boolean
  }
}

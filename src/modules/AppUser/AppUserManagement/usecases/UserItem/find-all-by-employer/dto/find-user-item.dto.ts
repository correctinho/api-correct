import { UserItemStatus } from "@prisma/client"


export type OutputFindAllAppUserItemsDTO = {
  uuid: string
  user_info_uuid: string
  item_uuid: string
  img_url?: string
  item_name: string
  balance: number
  status: UserItemStatus,
  created_at: string,
  Provider: {
    business_info_uuid: string
    fantasy_name: string
  }
}

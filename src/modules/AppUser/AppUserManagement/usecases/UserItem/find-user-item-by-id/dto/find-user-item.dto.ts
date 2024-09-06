import { UserItemStatus } from "@prisma/client"


export type OutputFindAppUserItemByIdDTO = {
  uuid: string
  user_info_uuid: string
  item_uuid: string
  item_name: string
  balance: number
  status: UserItemStatus,
  created_at: string
}

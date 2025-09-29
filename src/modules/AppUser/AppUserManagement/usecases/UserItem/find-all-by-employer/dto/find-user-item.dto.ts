import { UserItemStatus } from "@prisma/client"


export type OutputFindAllAppUserItemsDTO = {
  uuid: string
  item_name: string
  status: UserItemStatus,
  balance: number
}

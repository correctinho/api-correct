import { TransactionType, UserItemStatus } from "@prisma/client"

export type InputCreatePOSTransactionByBusinessDTO = {
  amount: number
  business_info_uuid: string
  description?: string | null
  item_uuid?: string
  partner_user_uuid: string
  transaction_type: TransactionType
}

export type OutputCreatePOSTransactionByBusinessDTO = {
  transaction_uuid: string,
  business_info_uuid: string,
  fee: number,
  created_at: string
}


export type InputGetTransactionByAppUserDTO = {
  transactionId: string,
  appUserId: string
  appUserInfoID: string
}

export type OutputGetTransactionByAppUserDTO = {
  transaction_uuid: string,
  fantasy_name: string,
  amount: number,
  created_at: string,
  availableItems: AvailableUserItemDetails[]
}
export interface AvailableUserItemDetails {
  item_uuid: string;
  item_name: string;
  balance: number;
  status: UserItemStatus;
}

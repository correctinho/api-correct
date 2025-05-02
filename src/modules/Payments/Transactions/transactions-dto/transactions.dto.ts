import { TransactionType } from "@prisma/client"

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
  user_item_uuid: string,
  favored_user_uuid: string,
  favored_business_info_uuid: string,
  amount: number,
  fee_amount: number,
  cashback: number,
  description: string,
  status: string,
  transaction_type: string,
  created_at: string,
  updated_at: string
}

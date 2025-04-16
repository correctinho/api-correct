import { TransactionType } from "@prisma/client"

export type InputCreatePOSTransactionByBusinessDTO = {
  amount: number
  business_info_uuid: string
  description?: string | null
  item_uuid: string
  partner_user_uuid: string
  transaction_type: TransactionType
}

export type OutputCreatePOSTransactionByBusinessDTO = {
  transaction_uuid: string,
  business_info_uuid: string,
  fee: number,
  created_at: string
}

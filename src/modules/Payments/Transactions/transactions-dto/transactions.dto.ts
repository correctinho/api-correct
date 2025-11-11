import { TransactionStatus, TransactionType, UserItemStatus } from "@prisma/client"

export type InputCreatePOSTransactionByBusinessDTO = {
  business_info_uuid: string
  business_user_uuid: string
  partner_user_uuid: string
  transaction_type: TransactionType
  original_price: number           // valor real da venda
  discount_percentage: number       // desconto fornecido
  net_price: number     // valor calculado
}

export type OutputCreatePOSTransactionByBusinessDTO = {
  transaction_uuid: string,
  user_item_uuid?: string,
  favored_user_uuid?: string,
  favored_business_info_uuid?: string,
  original_price: number,
  discount_percentage: number,
  net_price: number,
  fee_percentage?: number, // Optional: Defaults to 0
  fee_amount: number,
  platform_net_fee_amount: number,
  cashback?: number,
  description?: string | null,
  transaction_status: TransactionStatus
  transaction_type: TransactionType,
  favored_partner_user_uuid: string,
  paid_at?: string | null,
  created_at: string,
  updated_at?: string | null
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
  user_benefit_uuid: string;
  item_uuid: string;
  item_name: string;
  balance: number;
  status: UserItemStatus;
}

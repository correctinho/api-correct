// src/application/usecases/transactions/dto/process-pos-transaction-with-offline-token.dto.ts
import { TransactionStatus, TransactionType, UserItemStatus, OfflineTokenStatus } from "@prisma/client";

export type InputProcessPOSTransactionWithOfflineTokenDTO = {
  business_info_uuid: string;
  partner_user_uuid: string;
  original_price: number;
  discount_percentage: number;
  net_price: number;
  description?: string | null;
  tokenCode: string;
}

export type OutputProcessPOSTransactionWithOfflineTokenDTO = {
  transaction_uuid: string;
  transaction_status: TransactionStatus;
  paid_at?: string | null;
  offline_token_code: string;
  offline_token_status: OfflineTokenStatus;
  finalBalance: number;
  cashback: number;
  message: string;
}
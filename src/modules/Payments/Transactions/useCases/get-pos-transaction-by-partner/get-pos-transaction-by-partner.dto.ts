export type InputGetTransactionByPartnerDTO = {
  transactionId: string;
}

export type OutputGetTransactionByPartnerDTO = {
  transaction_uuid: string;
  fantasy_name: string;
  amount: number;
  created_at: string;
}

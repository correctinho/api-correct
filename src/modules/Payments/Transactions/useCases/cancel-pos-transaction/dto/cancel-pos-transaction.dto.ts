export interface InputCancelPOSTransactionDTO {
  transaction_uuid: string;
  partner_user_uuid: string; // Quem está cancelando
}

export interface OutputCancelPOSTransactionDTO {
  transaction_uuid: string;
  status: string;
  updated_at: string | null;
}
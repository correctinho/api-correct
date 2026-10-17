export interface InputGetPOSTransactionStatusDTO {
  transactionId: string;
  business_info_uuid: string;
}

export interface OutputGetPOSTransactionStatusDTO {
  code: number;
  status: string;
}

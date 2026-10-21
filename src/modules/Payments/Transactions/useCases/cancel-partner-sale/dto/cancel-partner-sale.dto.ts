export interface InputCancelPartnerSaleDTO {
  transaction_uuid: string;
  business_info_uuid: string; // The partner that is requesting the cancellation
  reason: string; // Mandatory reason for cancellation
}

export interface OutputCancelPartnerSaleDTO {
  transaction_uuid: string;
  status: string;
  updated_at: string;
}

export interface InputCancelSaleByAdminDTO {
  transaction_uuid: string;
  reason: string;
}

export interface OutputCancelSaleByAdminDTO {
  transaction_uuid: string;
  status: string;
  updated_at: string;
}

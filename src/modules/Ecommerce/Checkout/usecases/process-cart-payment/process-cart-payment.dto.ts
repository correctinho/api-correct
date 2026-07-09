export interface InputProcessCartPaymentDTO {
  cart_uuid: string;
  payment_method_uuid: string; // O UserItem selecionado
  appUserInfoID: string;
  appUserUUID: string;
}

export interface OutputProcessCartPaymentDTO {
  ecommerce_order_uuid: string;
  transaction_uuid: string;
  delivery_status: string;
}

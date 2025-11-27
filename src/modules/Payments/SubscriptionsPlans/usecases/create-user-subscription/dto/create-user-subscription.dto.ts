export interface InputCreateUserSubscriptionDto {
  user_info_uuid: string;
  subscription_plan_uuid: string;
}

export interface OutputCreateUserSubscriptionDto {
  subscription_uuid: string;
  user_item_uuid: string; // Retornamos o ID do item técnico também
  status: string;
  pix_qr_code: string;
  pix_expiration: Date;
  amount_in_cents: number;
}
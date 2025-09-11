export type InputProcessPaymentDTO = {
  transactionId: string;
  existing_pin: string | null;
  appUserInfoID: string
  benefit_uuid: string
  incoming_pin: string;
}

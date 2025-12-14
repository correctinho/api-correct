export type InputGetUserItemHistoryDTO = {
  user_item_uuid: string
  user_info_uuid: string
  year?: number
  month?: number
  startDate?: Date;
  endDate?: Date;
}
export type OutputGetUserItemHistoryDTO = {
  uuid: string,
  event_type: string
  amount: number,
  balance_before: number,
  balance_after: number,
  related_transaction_uuid: string
  counterparty_name?: string | null
  user_info_uuid: string
  created_at: Date
}

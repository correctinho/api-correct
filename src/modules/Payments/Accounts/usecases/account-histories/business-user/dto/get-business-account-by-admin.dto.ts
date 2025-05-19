export type InputGetBusinessAccountHistoryDTO = {
  business_info_uuid: string
  year: number,
  month: number
}

export type OutputGetBusinessAccountHistoryDTO = {
  uuid: string
  business_account_uuid: string
  event_type: string
  amount: number,
  balance_before: number,
  balance_after: number,
  related_transaction_uuid: string,
  created_at: Date
}

export type InputGetBusinessAccountDTO = {
  business_info_uuid: string;
}

export type OutputGetBusinessAccountDTO = {
  uuid: string;
  business_info_uuid: string;
  balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

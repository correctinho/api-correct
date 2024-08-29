export interface InputSetEmployerCyclesDTO {
  business_info_uuid: string,
  item_uuid: string,
  cycle_end_day: number
}

export interface OutputSetEmployerCyclesDTO {
  uuid: string
  item_uuid: string
  business_info_uuid: string
  cycle_start_day?: number
  cycle_end_day?: number
  created_at?: string
  updated_at?: string
}

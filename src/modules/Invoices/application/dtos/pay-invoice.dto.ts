export interface PayInvoiceInputDTO {
  uuid: string;
}

export interface PayInvoiceOutputDTO {
  uuid: string;
  business_info_uuid: string;
  reference_month: string;
  cycle_start_date: Date;
  cycle_end_date: Date;
  due_date: Date;
  total_amount: number;
  status: string;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ListInvoicesInputDTO {
  page: number;
  limit: number;
  status?: string;
  business_info_uuid?: string;
  reference_month?: string;
}

export interface ListInvoicesOutputDTO {
  data: InvoiceOutput[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceOutput {
  uuid: string;
  business_info_uuid: string;
  fantasy_name: string;
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

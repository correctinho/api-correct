export interface InputListTransactionsDto {
  page?: number;
  limit?: number;
  status?: string;
  start_date?: string | Date;
  end_date?: string | Date;
  search?: string;
}

export interface TransactionSummaryDto {
  uuid: string;
  amount: number;
  net_price: number;
  platform_fee: number;
  transaction_type: string;
  status: string;
  created_at: string;
  paid_at?: string | null;
  favored_business_info_uuid?: string | null;
  favored_business_name?: string | null;
}

export interface OutputListTransactionsDto {
  data: TransactionSummaryDto[];
  meta: {
    total_records: number;
    current_page: number;
    total_pages: number;
    total_platform_fee: number;
  };
}

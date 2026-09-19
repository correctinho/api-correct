export interface GetPartnerSalesRequestDTO {
  business_info_uuid: string;
  page: number;
  limit: number;
}

export interface PartnerSaleItemDTO {
  uuid: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  payerName: string | null;
  operatorName: string | null;
}

export interface GetPartnerSalesResponseDTO {
  data: PartnerSaleItemDTO[];
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

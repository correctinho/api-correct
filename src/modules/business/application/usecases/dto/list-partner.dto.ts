export interface ListPartnerInputDto {
  status?: string;
  document?: string;
  page?: number;
  limit?: number;
}

export interface PartnerEntity {
  uuid: string;
  fantasy_name: string;
  document: string;
  email: string;
  phone_1: string;
  status: string;
  business_type: string;
  created_at: Date;
  users_count: number;
}

export interface ListPartnerOutputDto {
  data: PartnerEntity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

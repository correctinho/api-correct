export interface GetBusinessDetailInputDto {
  uuid: string;
}

export interface GetBusinessDetailOutputDto {
  uuid: string;
  fantasy_name: string;
  corporate_reason: string | null;
  document: string;
  classification: string;
  colaborators_number: number;
  status: string;
  phone_1: string;
  phone_2: string | null;
  email: string;
  business_type: string;
  employer_branch: string | null;
  created_at: string;
  updated_at: string | null;
  approved_at: string | null;
  Address: any;
  BusinessinfoBranch: any;
  PartnerConfig: any;
  users_count: number;
}

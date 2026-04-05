export interface ListEmployerInputDto {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmployerEntity {
  uuid: string;
  fantasy_name: string;
  document: string;
  email: string;
  phone_1: string;
  status: string;
  created_at: string;
}

export interface ListEmployerOutputDto {
  data: EmployerEntity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

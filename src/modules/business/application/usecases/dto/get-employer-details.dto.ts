export interface EmployerBenefitDto {
  item_uuid: string;
  name: string;
  category?: string;
  cycle_end_day: number | null;
  reference_value: number;
}

export interface GetEmployerDetailsOutputDto {
  uuid: string;
  fantasy_name: string;
  document: string;
  email: string;
  phone_1: string;
  phone_2: string;
  payroll_closing_day: number;
  txt_delivery_day: number;
  colaborators_number: number;
  classification: string;
  status: string;
  address: {
    line1?: string | null;
    line2?: string | null;
    line3?: string | null;
    postal_code: string;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  benefits: EmployerBenefitDto[];
}

export type OutputGetOneBenefitGroupsDTO = {
  uuid: string;
  value: number;
  business_info_uuid: string;
  group_name: string;
  created_at: string;
  employees: {
    employee_uuid: string
    document: string;
    full_name: string;
  }[];
  benefits: {
    benefit_uuid: string;
    benefit_name: string;
  }[];
};

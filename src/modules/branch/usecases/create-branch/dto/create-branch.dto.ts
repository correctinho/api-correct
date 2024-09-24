export type InputCreateBranchDTO = {
  name: string;
  benefits_uuid?: string[];
  benefits_name?: string[];
  marketing_tax: number;
  admin_tax: number;
  market_place_tax: number;
  created_at?: string;
  updated_at?: string;
}

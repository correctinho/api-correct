export interface OutputGetBranchDTO {
  uuid: string;
  name: string;
  marketing_tax: number;
  admin_tax: number;
  market_place_tax: number;
  benefits: {
    uuid: string;
    name: string;
  }[]; // Detalhes dos benefícios vinculados
  created_at: string | Date | null;
  updated_at: string | Date | null;
}
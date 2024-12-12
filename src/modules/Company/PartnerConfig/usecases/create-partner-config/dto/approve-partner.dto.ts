import { PartnerCategory } from "../../../entities/partner-config.entity"

export type InputCreatePartnerConfig = {
  business_info_uuid: string,
  main_branch_uuid: string,
  partner_category: PartnerCategory[]
  use_market_place: boolean
}

export type OutputCreatePartnerConfig = {
  uuid: string;
  business_info_uuid: string;
  main_branch: string;
  partner_category: PartnerCategory[];
  items_uuid: string[];
  admin_tax: number;
  marketing_tax: number;
  market_place_tax: number;
  use_market_place: boolean;
  created_at: string;
}

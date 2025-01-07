import { SalesType } from "@prisma/client"
import { PartnerCategory } from "../../../entities/partner-config.entity"

export type InputSetDefinitionsByBusinessAdmin = {
  uuid: string
  business_info_uuid: string,
  title?: string,
  phone?: string,
  description?: string,
  sales_type?: string
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

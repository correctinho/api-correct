import { SalesType } from "@prisma/client"
import { PartnerCategory } from "../../../entities/partner-config.entity"

export type InputSetDefinitionsByBusinessAdmin = {
  uuid?: string;
  business_info_uuid: string;
  title?: string;
  phone?: string;
  description?: string;
  sales_type?: string;
  dispatch_address?: {
    postal_code: string;
    line1: string;
    line2: string;
    line3?: string;
    neighborhood: string;
    city?: string;
    state?: string;
  } | null;
}

export type OutputSetDefinitionsByBusinessAdmin = {
  uuid: string;
  business_info_uuid: string;
  title: string | undefined;
  phone: string | undefined;
  description: string | undefined;
  sales_type: string | undefined;
  dispatch_address_uuid: string | undefined;
  updated_at: string | undefined;
}

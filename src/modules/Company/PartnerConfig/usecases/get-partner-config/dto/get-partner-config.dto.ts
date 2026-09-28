export type InputGetPartnerConfigDTO = {
  business_info_uuid: string;
}

export type OutputGetPartnerConfigDTO = {
  uuid: string
  business_info_uuid: string
  main_branch: string
  items_uuid: string[]
  admin_tax: number
  marketing_tax: number
  use_marketing: boolean
  market_place_tax: number
  use_market_place: boolean
  title: string
  phone: string
  description: string | null
  sales_type: string
  cashback_tax: number
  created_at: string
  dispatch_address?: {
    line1: string;
    line2: string;
    line3?: string | null;
    neighborhood: string;
    postal_code: string;
    city?: string | null;
    state?: string | null;
  } | null
}

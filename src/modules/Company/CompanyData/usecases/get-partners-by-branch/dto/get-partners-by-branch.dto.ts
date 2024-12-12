export type InputGetPartnersByBranchDTO = {
  branch_uuid: string,
  page: number,
  city: string
}

export type OutputGetPartnersByBranchrDTO = {
  uuid: string,
  fantasy_name: string,
  branch_uuid: string,
  corporate_reason: string,
  document: string,
  has_online_products: boolean,
  Address: {
    line1: string | null;
    line2: string | null;
    line3: string | null;
    postal_code: string;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    created_at?: string;
    updated_at?: string;
  },
  Products?: Product[]
}

type Product = {
  uuid: string,
  category_uuid: string,
  ean_code: string,
  brand: string,
  name: string,
  description: string,
  original_price: number,
  promotional_price: number,
  discount: number,
  images_url: string[],
  is_mega_promotion: boolean,
  stock: number,
  weight: string,
  height: string,
  width: string,
  business_info_uuid: string,
  is_active: boolean,
  created_at: string,
  updated_at: string
}

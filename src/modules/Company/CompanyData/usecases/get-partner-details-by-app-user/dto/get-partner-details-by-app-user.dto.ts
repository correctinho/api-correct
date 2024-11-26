export type InputGetPartnerDetailsByAppUserDTO = {
  business_info_uuid: string
}

// Tipagem para o endereço
interface Address {
  uuid: string;
  line1: string;
  line2: string | null;
  line3: string | null;
  postal_code: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  created_at: string | null;
  updated_at: string | null;
}

// Tipagem para os produtos
export interface Product {
  uuid: string;
  category_uuid: string;
  ean_code: string | null;
  brand: string;
  name: string;
  description: string;
  original_price: number;
  promotional_price: number;
  discount: number;
  image_urls: string[]; // Considerando um array de strings para as URLs
  is_mega_promotion: boolean;
  stock: number;
  weight: string;
  height: string;
  width: string;
  business_info_uuid: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Tipagem para o parceiro
interface Partner {
  uuid: string;
  fantasy_name: string;
  corporate_reason: string | null;
  document: string;
  classification: string;
  colaborators_number: number;
  status: string;
  phone_1: string;
  phone_2: string | null;
  email: string;
  business_type: string;
  employer_branch: string | null;
  created_at: string;
  updated_at: string | null;
}

// Tipagem do retorno do método execute
export interface OutputGetPartnerDetailsByAppUserResponse {
  partner: Partner;
  address: Address | null; // Pode ser nulo se não houver endereço
  products: Product[];
}

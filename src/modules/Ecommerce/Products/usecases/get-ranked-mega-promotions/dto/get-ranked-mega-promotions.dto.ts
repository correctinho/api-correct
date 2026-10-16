export interface InputGetRankedMegaPromotionsDTO {
  userInfoUuid?: string | null;
  lat?: number | null;
  lng?: number | null;
  limit?: number;
}

export interface RankedMegaPromotionItemDTO {
  uuid: string;
  name: string;
  description: string | null;
  brand: string | null;
  original_price: number;
  promotional_price: number;
  discount: number;
  stock: number;
  image_urls: string[];
  product_type: string;
  category_uuid: string;
  category_name?: string | null;
  business_info_uuid: string;
  business_name: string;
  distance_km: number | null;
  relevance_score: number;
  relevance_reason: string;
  has_matching_balance: boolean;
}

export interface OutputGetRankedMegaPromotionsDTO {
  personalized_pitch: string | null;
  promotions: RankedMegaPromotionItemDTO[];
  total: number;
  source: 'cache' | 'ai_generated' | 'fallback';
}

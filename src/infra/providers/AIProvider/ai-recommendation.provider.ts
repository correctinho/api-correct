export interface GeneratePersonalizedPitchInput {
  userName?: string | null;
  activeWalletNames?: string[];
  topPromotion: {
    productName: string;
    businessName: string;
    discountPercent: number;
    promotionalPrice: number;
    categoryName?: string | null;
    distanceKm?: number | null;
  };
}

export interface IAIRecommendationProvider {
  generatePersonalizedPitch(input: GeneratePersonalizedPitchInput): Promise<string | null>;
}

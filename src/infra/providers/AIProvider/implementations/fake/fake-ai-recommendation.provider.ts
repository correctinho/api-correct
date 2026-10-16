import {
  GeneratePersonalizedPitchInput,
  IAIRecommendationProvider,
} from '../../ai-recommendation.provider';

export class FakeAIRecommendationProvider implements IAIRecommendationProvider {
  public shouldFail = false;
  public customPitch: string | null = null;

  async generatePersonalizedPitch(
    input: GeneratePersonalizedPitchInput
  ): Promise<string | null> {
    if (this.shouldFail) return null;
    if (this.customPitch) return this.customPitch;

    const name = input.userName || 'Você';
    return `${name}, aproveite ${topPromoName(input)} com ${input.topPromotion.discountPercent}% OFF!`;
  }
}

function topPromoName(input: GeneratePersonalizedPitchInput): string {
  return input.topPromotion.productName;
}

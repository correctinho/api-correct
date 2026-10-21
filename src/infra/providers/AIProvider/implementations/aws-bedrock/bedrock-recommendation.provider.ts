import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
  GeneratePersonalizedPitchInput,
  IAIRecommendationProvider,
} from '../../ai-recommendation.provider';

export class BedrockRecommendationProvider implements IAIRecommendationProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (accessKeyId && secretAccessKey) {
      this.client = new BedrockRuntimeClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.client = new BedrockRuntimeClient({ region });
    }

    // Modelo serverless moderno via Bedrock Converse API (ou customizado via env)
    this.modelId =
      process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-2-lite-v1:0';
  }

  async generatePersonalizedPitch(
    input: GeneratePersonalizedPitchInput
  ): Promise<string | null> {
    try {
      const { userName, activeWalletNames, topPromotion } = input;

      const userContext = [
        userName ? `Nome: ${userName}` : null,
        activeWalletNames && activeWalletNames.length > 0
          ? `Carteiras com saldo disponível: ${activeWalletNames.join(', ')}`
          : 'Saldo: Geral',
        `Produto: ${topPromotion.productName}`,
        `Estabelecimento: ${topPromotion.businessName}`,
        `Desconto: ${topPromotion.discountPercent}% OFF`,
        `Preço Promocional: R$ ${topPromotion.promotionalPrice.toFixed(2)}`,
        topPromotion.distanceKm !== null && topPromotion.distanceKm !== undefined
          ? `Distância: ${topPromotion.distanceKm} km`
          : null,
      ]
        .filter(Boolean)
        .join('\n');

      const prompt = `Você é a inteligência artificial do app de benefícios SysCorrect.
Crie exatamente 1 frase curta (máximo 14 palavras), natural e persuasiva em português recomendando a promoção abaixo ao usuário.
Não use aspas, nem pontuações de diálogo, nem emojis excessivos (no máximo 1 emoji).
Foque no benefício prático e na proximidade ou no saldo.

Dados:
${userContext}`;

      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 60,
          temperature: 0.5,
        },
      });

      // Timeout preventivo de 2.5s para não atrasar a resposta da tela
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 2500)
      );

      const responsePromise = this.client.send(command).then((res) => {
        const text = res.output?.message?.content?.[0]?.text?.trim() || null;
        return text ? text.replace(/^["']|["']$/g, '') : null;
      });

      const result = await Promise.race([responsePromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.warn(
        '[BedrockRecommendationProvider] Falha silenciosa ao chamar Bedrock, usando fallback heurístico:',
        (err as any)?.message || err
      );
      return null;
    }
  }
}

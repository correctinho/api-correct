import { IProductRepository } from '../../repositories/product.repository';
import { IRedisCacheRepository } from '../../../../../infra/redis/redis-cache.repository';
import { IAIRecommendationProvider } from '../../../../../infra/providers/AIProvider/ai-recommendation.provider';
import {
  InputGetRankedMegaPromotionsDTO,
  OutputGetRankedMegaPromotionsDTO,
  RankedMegaPromotionItemDTO,
} from './dto/get-ranked-mega-promotions.dto';

function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export class GetRankedMegaPromotionsUsecase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly redisCacheRepository: IRedisCacheRepository,
    private readonly aiRecommendationProvider: IAIRecommendationProvider
  ) {}

  async execute(
    input: InputGetRankedMegaPromotionsDTO
  ): Promise<OutputGetRankedMegaPromotionsDTO> {
    const userLat = input.lat ?? null;
    const userLng = input.lng ?? null;

    // 1. Verificação de Cache Inteligente no Redis
    // Chave de cache com arredondamento de coordenadas para agrupar proximidade
    const latKey = userLat ? userLat.toFixed(2) : 'none';
    const lngKey = userLng ? userLng.toFixed(2) : 'none';
    const cacheKey = `mega_promo_feed:${input.userInfoUuid || 'anonymous'}:${latKey}_${lngKey}`;

    try {
      const cached = await this.redisCacheRepository.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as OutputGetRankedMegaPromotionsDTO;
        parsed.source = 'cache';
        return parsed;
      }
    } catch (cacheErr) {
      console.warn('[GetRankedMegaPromotionsUsecase] Erro ao consultar Redis, prosseguindo sem cache:', cacheErr);
    }

    // 2. Busca de Mega Promoções ativas no Banco
    const rawPromotions = await this.productRepository.findActiveMegaPromotions();

    if (!rawPromotions || rawPromotions.length === 0) {
      return {
        personalized_pitch: null,
        promotions: [],
        total: 0,
        source: 'fallback',
      };
    }

    let finalLat = userLat;
    let finalLng = userLng;
    let userName: string | null = null;
    let favoriteBusinessUuids: string[] = [];
    let userBalances: { item_name: string; balance: number }[] = [];

    // 3. Perfil do Usuário
    if (input.userInfoUuid) {
      const userProfile = await this.productRepository.getUserRecommendationProfile(
        input.userInfoUuid
      );
      if (userProfile) {
        userName = userProfile.userName || null;
        if (!finalLat && userProfile.userAddress?.latitude) {
          finalLat = userProfile.userAddress.latitude;
        }
        if (!finalLng && userProfile.userAddress?.longitude) {
          finalLng = userProfile.userAddress.longitude;
        }
        favoriteBusinessUuids = userProfile.favoriteBusinessUuids || [];
        userBalances = userProfile.userBalances || [];
      }
    }

    // 4. Scoring Heurístico Ponderado (0 a 100)
    const scoredPromotions: RankedMegaPromotionItemDTO[] = rawPromotions.map(
      (promo) => {
        // Proximidade (25%)
        let distanceKm: number | null = null;
        let proximityScore = 15;

        if (
          finalLat !== null &&
          finalLng !== null &&
          promo.latitude !== null &&
          promo.longitude !== null
        ) {
          distanceKm = calculateHaversineDistanceKm(
            finalLat,
            finalLng,
            promo.latitude,
            promo.longitude
          );

          if (distanceKm <= 2) proximityScore = 25;
          else if (distanceKm <= 5) proximityScore = 20;
          else if (distanceKm <= 10) proximityScore = 15;
          else if (distanceKm <= 25) proximityScore = 10;
          else proximityScore = 3;
        }

        // Afinidade (35%)
        const hasBoughtFromPartner = favoriteBusinessUuids.includes(
          promo.business_info_uuid
        );
        const affinityScore = hasBoughtFromPartner ? 35 : 10;

        // Saldo em Carteira (20%)
        let balanceScore = 0;
        let hasMatchingBalance = false;
        let matchedWalletName: string | null = null;

        const categoryNameNormalized = (promo.category_name || '').toLowerCase();

        for (const wallet of userBalances) {
          if (wallet.balance > 0) {
            const walletNameNormalized = (wallet.item_name || '').toLowerCase();
            const isMatch =
              (categoryNameNormalized.includes('alimenta') &&
                walletNameNormalized.includes('alimenta')) ||
              (categoryNameNormalized.includes('refei') &&
                walletNameNormalized.includes('refei')) ||
              (categoryNameNormalized.includes('combust') &&
                walletNameNormalized.includes('combust')) ||
              (categoryNameNormalized.includes('farm') &&
                walletNameNormalized.includes('farm')) ||
              walletNameNormalized.includes('flex') ||
              walletNameNormalized.includes('premi') ||
              walletNameNormalized.includes('multi');

            if (isMatch) {
              hasMatchingBalance = true;
              matchedWalletName = wallet.item_name;
              balanceScore = 20;
              break;
            } else {
              balanceScore = Math.max(balanceScore, 10);
            }
          }
        }

        // Desconto (15%)
        const rawDiscount = promo.discount || 0;
        const discountVal = rawDiscount > 100 ? Math.round(rawDiscount / 10000) : rawDiscount;
        const discountScore = Math.min(15, Math.round((discountVal / 50) * 15));

        // Estoque (5%)
        const stockScore = promo.stock > 0 ? 5 : 0;

        const totalScore =
          proximityScore +
          affinityScore +
          balanceScore +
          discountScore +
          stockScore;

        let relevanceReason = 'Mega Promoção em destaque';
        if (hasBoughtFromPartner) {
          relevanceReason = 'Baseado no que você mais compra';
        } else if (hasMatchingBalance && matchedWalletName) {
          relevanceReason = `Saldo disponível em ${matchedWalletName}`;
        } else if (distanceKm !== null && distanceKm <= 3) {
          relevanceReason = `A apenas ${distanceKm} km de você`;
        } else if (discountVal >= 25) {
          relevanceReason = `Mega desconto de ${discountVal}%`;
        }

        return {
          uuid: promo.uuid,
          name: promo.name,
          description: promo.description,
          brand: promo.brand,
          original_price: promo.original_price / 100,
          promotional_price: promo.promotional_price / 100,
          discount: discountVal,
          stock: promo.stock,
          image_urls: promo.image_urls,
          product_type: promo.product_type,
          category_uuid: promo.category_uuid,
          category_name: promo.category_name,
          business_info_uuid: promo.business_info_uuid,
          business_name: promo.business_name,
          distance_km: distanceKm,
          relevance_score: totalScore,
          relevance_reason: relevanceReason,
          has_matching_balance: hasMatchingBalance,
        };
      }
    );

    // Ordenação decrescente de pontuação
    scoredPromotions.sort((a, b) => b.relevance_score - a.relevance_score);

    // Diversidade de parceiros nos primeiros slots
    const maxItems = input.limit && input.limit > 0 ? input.limit : 10;
    const seenPartners = new Set<string>();
    const diverseList: RankedMegaPromotionItemDTO[] = [];
    const remainingList: RankedMegaPromotionItemDTO[] = [];

    for (const promo of scoredPromotions) {
      if (!seenPartners.has(promo.business_info_uuid)) {
        seenPartners.add(promo.business_info_uuid);
        diverseList.push(promo);
      } else {
        remainingList.push(promo);
      }
    }

    const finalPromotions = [...diverseList, ...remainingList].slice(0, maxItems);

    // 5. Chamada Otimizada ao AWS Bedrock:
    // Só chamamos Bedrock se o usuário tiver dados reais (não for cold start) e houver produto ranqueado
    let personalizedPitch: string | null = null;
    let source: 'ai_generated' | 'fallback' = 'fallback';

    const hasUserData = Boolean(
      input.userInfoUuid && (userBalances.length > 0 || favoriteBusinessUuids.length > 0)
    );

    if (hasUserData && finalPromotions.length > 0) {
      const topPromo = finalPromotions[0];
      const activeWalletNames = userBalances
        .filter((w) => w.balance > 0)
        .map((w) => w.item_name);

      personalizedPitch = await this.aiRecommendationProvider.generatePersonalizedPitch({
        userName,
        activeWalletNames,
        topPromotion: {
          productName: topPromo.name,
          businessName: topPromo.business_name,
          discountPercent: topPromo.discount,
          promotionalPrice: topPromo.promotional_price,
          categoryName: topPromo.category_name,
          distanceKm: topPromo.distance_km,
        },
      });

      if (personalizedPitch) {
        source = 'ai_generated';
      }
    }

    if (!personalizedPitch) {
      personalizedPitch = finalPromotions.length > 0
        ? `Aproveite as Mega Promoções selecionadas para você hoje!`
        : null;
    }

    const responsePayload: OutputGetRankedMegaPromotionsDTO = {
      personalized_pitch: personalizedPitch,
      promotions: finalPromotions,
      total: finalPromotions.length,
      source,
    };

    // 6. Armazenar em cache no Redis por 8 horas (28800 segundos)
    try {
      await this.redisCacheRepository.set(cacheKey, JSON.stringify(responsePayload), 28800);
    } catch (saveCacheErr) {
      console.warn('[GetRankedMegaPromotionsUsecase] Erro ao gravar cache no Redis:', saveCacheErr);
    }

    return responsePayload;
  }
}

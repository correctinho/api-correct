import { IProductRepository } from '../../repositories/product.repository';
import { IPushNotificationProvider } from '../../../../../infra/providers/PushNotificationProvider/push-notification.provider';
import { IRedisCacheRepository } from '../../../../../infra/redis/redis-cache.repository';
import {
  SendTargetedMegaPromotionPushInput,
  SendTargetedMegaPromotionPushOutput,
} from './dto/send-targeted-mega-promotion-push.dto';

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
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
  return R * c;
}

export class SendTargetedMegaPromotionPushUsecase {
  constructor(
    private productRepository: IProductRepository,
    private pushNotificationProvider: IPushNotificationProvider,
    private redisCacheRepository: IRedisCacheRepository
  ) {}

  async execute(
    input: SendTargetedMegaPromotionPushInput
  ): Promise<SendTargetedMegaPromotionPushOutput> {
    const { productUuid, maxDistanceKm = 15 } = input;

    // 1. Obter os usuários candidatos e os dados da promoção
    const { users, promotion } =
      await this.productRepository.findTargetUsersForMegaPromotion(productUuid);

    if (!promotion) {
      return {
        success: false,
        productName: null,
        notifiedCount: 0,
        message: 'Produto não encontrado ou não é uma Mega Promoção ativa',
      };
    }

    if (!users || users.length === 0) {
      return {
        success: true,
        productName: promotion.productName,
        notifiedCount: 0,
        message: 'Nenhum usuário cadastrado para receber notificações',
      };
    }

    const eligibleUserIds: string[] = [];

    // 2. Filtragem por Geometria e Trava Anti-Spam
    for (const candidate of users) {
      // a) Trava Anti-Spam (1 push promocional a cada 24h por usuário)
      const antiSpamKey = `promo_push_anti_spam:${candidate.user_info_uuid}`;
      const recentlyNotified = await this.redisCacheRepository.get(antiSpamKey);
      if (recentlyNotified) {
        continue; // Ignora para não fazer spam
      }

      // b) Validação de Distância (se ambos tiverem coordenadas)
      if (
        promotion.partnerLatitude !== null &&
        promotion.partnerLongitude !== null &&
        candidate.latitude !== null &&
        candidate.longitude !== null
      ) {
        const distance = calculateHaversineDistance(
          promotion.partnerLatitude,
          promotion.partnerLongitude,
          candidate.latitude,
          candidate.longitude
        );

        if (distance > maxDistanceKm) {
          continue; // Fora do raio do parceiro
        }
      }

      eligibleUserIds.push(candidate.user_info_uuid);
    }

    if (eligibleUserIds.length === 0) {
      return {
        success: true,
        productName: promotion.productName,
        notifiedCount: 0,
        message: 'Nenhum usuário qualificado dentro do raio ou com limite anti-spam liberado',
      };
    }

    // 3. Montagem do Push Persuasivo com Deep Link
    const title = `🔥 Mega Promoção: ${promotion.productName} com ${promotion.discountPercent}% OFF!`;
    const message = `${promotion.businessName} pertinho de você: aproveite hoje com seu benefício!`;
    const url = `/partner/${promotion.businessInfoUuid}`;

    // 4. Disparo via OneSignal
    const result = await this.pushNotificationProvider.sendPushNotification({
      userIds: eligibleUserIds,
      title,
      message,
      url,
      data: {
        type: 'MEGA_PROMOTION',
        product_uuid: promotion.productUuid,
        business_info_uuid: promotion.businessInfoUuid,
      },
    });

    if (!result.success) {
      return {
        success: false,
        productName: promotion.productName,
        notifiedCount: 0,
        message: result.error || 'Falha ao disparar notificações via OneSignal',
      };
    }

    // 5. Aplicar trava Anti-Spam no Redis (TTL de 24 horas = 86400s)
    await Promise.all(
      eligibleUserIds.map((userId) =>
        this.redisCacheRepository.set(
          `promo_push_anti_spam:${userId}`,
          'sent',
          86400
        )
      )
    );

    return {
      success: true,
      productName: promotion.productName,
      notifiedCount: eligibleUserIds.length,
      notificationId: result.notificationId,
      message: `Notificações enviadas com sucesso para ${eligibleUserIds.length} usuários`,
    };
  }
}

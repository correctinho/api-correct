import { SendTargetedMegaPromotionPushUsecase } from '../send-targeted-mega-promotion-push.usecase';
import { IProductRepository } from '../../../repositories/product.repository';
import { FakePushNotificationProvider } from '../../../../../../infra/providers/PushNotificationProvider/implementations/fake-push-notification.provider';
import { IRedisCacheRepository } from '../../../../../../infra/redis/redis-cache.repository';

describe('Unit tests: SendTargetedMegaPromotionPushUsecase', () => {
  let usecase: SendTargetedMegaPromotionPushUsecase;
  let fakeProductRepo: Partial<IProductRepository>;
  let fakePushProvider: FakePushNotificationProvider;
  let fakeRedis: Partial<IRedisCacheRepository>;
  let redisMemory: Map<string, string>;

  beforeEach(() => {
    redisMemory = new Map();
    fakePushProvider = new FakePushNotificationProvider();

    fakeRedis = {
      get: jest.fn().mockImplementation(async (key: string) => {
        return redisMemory.get(key) || null;
      }),
      set: jest.fn().mockImplementation(async (key: string, value: string) => {
        redisMemory.set(key, value);
      }),
    };

    fakeProductRepo = {
      findTargetUsersForMegaPromotion: jest.fn(),
    };

    usecase = new SendTargetedMegaPromotionPushUsecase(
      fakeProductRepo as IProductRepository,
      fakePushProvider,
      fakeRedis as IRedisCacheRepository
    );
  });

  it('should return error if product is not found or not a mega promotion', async () => {
    (fakeProductRepo.findTargetUsersForMegaPromotion as jest.Mock).mockResolvedValue({
      users: [],
      promotion: null,
    });

    const result = await usecase.execute({ productUuid: 'invalid-id' });

    expect(result.success).toBe(false);
    expect(result.notifiedCount).toBe(0);
    expect(fakePushProvider.sentNotifications.length).toBe(0);
  });

  it('should filter out users outside maximum distance radius', async () => {
    (fakeProductRepo.findTargetUsersForMegaPromotion as jest.Mock).mockResolvedValue({
      promotion: {
        productUuid: 'promo-1',
        productName: 'Arroz Urbano',
        discountPercent: 25,
        promotionalPrice: 20,
        businessInfoUuid: 'partner-1',
        businessName: 'Supermercado Silva',
        categoryName: 'Alimentação',
        partnerLatitude: -23.55052,
        partnerLongitude: -46.633308,
      },
      users: [
        {
          user_info_uuid: 'user-near',
          userName: 'Carlos',
          latitude: -23.552, // ~200 metros
          longitude: -46.635,
          hasCategoryBalance: true,
          totalBalance: 150,
        },
        {
          user_info_uuid: 'user-far',
          userName: 'Ana',
          latitude: -24.0, // ~50 km de distância
          longitude: -47.0,
          hasCategoryBalance: true,
          totalBalance: 200,
        },
      ],
    });

    const result = await usecase.execute({ productUuid: 'promo-1', maxDistanceKm: 10 });

    expect(result.success).toBe(true);
    expect(result.notifiedCount).toBe(1);
    expect(fakePushProvider.sentNotifications.length).toBe(1);
    expect(fakePushProvider.sentNotifications[0].userIds).toEqual(['user-near']);
    expect(fakePushProvider.sentNotifications[0].title).toContain('Arroz Urbano com 25% OFF');
  });

  it('should respect anti-spam frequency capping (not sending if notified recently)', async () => {
    redisMemory.set('promo_push_anti_spam:user-spammed', 'sent');

    (fakeProductRepo.findTargetUsersForMegaPromotion as jest.Mock).mockResolvedValue({
      promotion: {
        productUuid: 'promo-1',
        productName: 'Feijão Carioca',
        discountPercent: 30,
        promotionalPrice: 8,
        businessInfoUuid: 'partner-1',
        businessName: 'Mercado Central',
        categoryName: 'Alimentação',
        partnerLatitude: -23.55,
        partnerLongitude: -46.63,
      },
      users: [
        {
          user_info_uuid: 'user-spammed',
          userName: 'Pedro',
          latitude: -23.551,
          longitude: -46.631,
          hasCategoryBalance: true,
          totalBalance: 100,
        },
        {
          user_info_uuid: 'user-free',
          userName: 'Julia',
          latitude: -23.551,
          longitude: -46.631,
          hasCategoryBalance: true,
          totalBalance: 100,
        },
      ],
    });

    const result = await usecase.execute({ productUuid: 'promo-1' });

    expect(result.success).toBe(true);
    expect(result.notifiedCount).toBe(1);
    expect(fakePushProvider.sentNotifications[0].userIds).toEqual(['user-free']);
    // Anti-spam deve ser gravado para o usuário notificado
    expect(fakeRedis.set).toHaveBeenCalledWith('promo_push_anti_spam:user-free', 'sent', 86400);
  });
});

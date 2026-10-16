import { GetRankedMegaPromotionsUsecase } from '../get-ranked-mega-promotions.usecase';
import { IProductRepository, ActiveMegaPromotionItem } from '../../../repositories/product.repository';
import { IRedisCacheRepository } from '../../../../../../infra/redis/redis-cache.repository';
import { FakeAIRecommendationProvider } from '../../../../../../infra/providers/AIProvider/implementations/fake/fake-ai-recommendation.provider';

describe('Unit tests: GetRankedMegaPromotionsUsecase (AI Scoring, Bedrock & Redis)', () => {
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockRedisRepo: jest.Mocked<IRedisCacheRepository>;
  let fakeAiProvider: FakeAIRecommendationProvider;
  let usecase: GetRankedMegaPromotionsUsecase;

  const mockPromotions: ActiveMegaPromotionItem[] = [
    {
      uuid: 'promo-1',
      name: 'Picanha Bovina Resfriada 1kg',
      description: 'Corte nobre com super desconto',
      brand: 'Friboi',
      original_price: 8990,
      promotional_price: 5990,
      discount: 33,
      stock: 50,
      image_urls: ['https://example.com/picanha.jpg'],
      product_type: 'PHYSICAL',
      category_uuid: 'cat-alimentacao',
      category_name: 'Alimentação e Mercado',
      business_info_uuid: 'partner-supermarket',
      business_name: 'Supermercado Central',
      latitude: -20.4697,
      longitude: -54.6201,
      city: 'Campo Grande',
      neighborhood: 'Centro',
    },
    {
      uuid: 'promo-2',
      name: 'Gasolina Comum Aditivada Litro',
      description: 'Abasteça com desconto',
      brand: 'Shell',
      original_price: 620,
      promotional_price: 549,
      discount: 11,
      stock: 1000,
      image_urls: ['https://example.com/combustivel.jpg'],
      product_type: 'PHYSICAL',
      category_uuid: 'cat-combustivel',
      category_name: 'Auto & Combustível',
      business_info_uuid: 'partner-posto',
      business_name: 'Posto Estrela',
      latitude: -20.4500,
      longitude: -54.6100,
      city: 'Campo Grande',
      neighborhood: 'Jardim dos Estados',
    },
  ];

  beforeEach(() => {
    mockProductRepo = {
      findActiveMegaPromotions: jest.fn(),
      getUserRecommendationProfile: jest.fn(),
      createProduct: jest.fn(),
      findBusinessProducts: jest.fn(),
      findActiveProductsByBusinessId: jest.fn(),
      delete: jest.fn(),
      updateWithHistory: jest.fn(),
      hasBookableServices: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockRedisRepo = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(undefined),
    };

    fakeAiProvider = new FakeAIRecommendationProvider();

    usecase = new GetRankedMegaPromotionsUsecase(
      mockProductRepo,
      mockRedisRepo,
      fakeAiProvider
    );
  });

  it('should return empty list when no active mega promotions exist', async () => {
    mockProductRepo.findActiveMegaPromotions.mockResolvedValue([]);

    const result = await usecase.execute({});

    expect(result.promotions).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.source).toBe('fallback');
  });

  it('should return cached result from Redis immediately without querying database or AI', async () => {
    const cachedPayload = {
      personalized_pitch: 'Oferta especial do cache!',
      promotions: [{ uuid: 'cached-promo' } as any],
      total: 1,
      source: 'cache' as const,
    };
    mockRedisRepo.get.mockResolvedValue(JSON.stringify(cachedPayload));

    const result = await usecase.execute({ userInfoUuid: 'cached-user' });

    expect(result.source).toBe('cache');
    expect(result.personalized_pitch).toBe('Oferta especial do cache!');
    expect(mockProductRepo.findActiveMegaPromotions).not.toHaveBeenCalled();
    expect(mockProductRepo.getUserRecommendationProfile).not.toHaveBeenCalled();
  });

  it('should NOT call AI for cold start (new/anonymous user), but still cache the result in Redis', async () => {
    mockProductRepo.findActiveMegaPromotions.mockResolvedValue(mockPromotions);
    const spyAi = jest.spyOn(fakeAiProvider, 'generatePersonalizedPitch');

    const result = await usecase.execute({});

    expect(result.promotions.length).toBe(2);
    // Cold start avoids calling AI to save tokens and cost
    expect(spyAi).not.toHaveBeenCalled();
    expect(result.source).toBe('fallback');
    expect(result.personalized_pitch).toContain('Aproveite as Mega Promoções');
    // Result is still saved in Redis
    expect(mockRedisRepo.set).toHaveBeenCalled();
  });

  it('should call AI to generate personalized pitch when user has active balance or history, and save to Redis with 8h TTL', async () => {
    mockProductRepo.findActiveMegaPromotions.mockResolvedValue(mockPromotions);
    mockProductRepo.getUserRecommendationProfile.mockResolvedValue({
      userName: 'Carlos',
      userAddress: null,
      favoriteBusinessUuids: [],
      userBalances: [{ item_name: 'Vale Alimentação', balance: 350.0 }],
    });

    const spyAi = jest.spyOn(fakeAiProvider, 'generatePersonalizedPitch');

    const result = await usecase.execute({ userInfoUuid: 'user-carlos' });

    expect(spyAi).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: 'Carlos',
        activeWalletNames: ['Vale Alimentação'],
        topPromotion: expect.objectContaining({
          productName: 'Picanha Bovina Resfriada 1kg',
        }),
      })
    );

    expect(result.source).toBe('ai_generated');
    expect(result.personalized_pitch).toContain('Carlos');
    expect(mockRedisRepo.set).toHaveBeenCalledWith(
      expect.stringContaining('mega_promo_feed:user-carlos'),
      expect.any(String),
      28800 // 8 horas
    );
  });

  it('should gracefully fallback to default pitch if AI provider fails', async () => {
    mockProductRepo.findActiveMegaPromotions.mockResolvedValue(mockPromotions);
    mockProductRepo.getUserRecommendationProfile.mockResolvedValue({
      userName: 'Carlos',
      userAddress: null,
      favoriteBusinessUuids: ['partner-supermarket'],
      userBalances: [],
    });

    fakeAiProvider.shouldFail = true;

    const result = await usecase.execute({ userInfoUuid: 'user-carlos' });

    expect(result.source).toBe('fallback');
    expect(result.personalized_pitch).toContain('Aproveite as Mega Promoções');
    expect(result.promotions.length).toBe(2);
  });
});

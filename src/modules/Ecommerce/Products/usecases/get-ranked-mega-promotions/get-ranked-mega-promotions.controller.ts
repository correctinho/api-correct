import { Request, Response } from 'express';
import { IProductRepository } from '../../repositories/product.repository';
import { IRedisCacheRepository } from '../../../../../infra/redis/redis-cache.repository';
import { IAIRecommendationProvider } from '../../../../../infra/providers/AIProvider/ai-recommendation.provider';
import { GetRankedMegaPromotionsUsecase } from './get-ranked-mega-promotions.usecase';

export class GetRankedMegaPromotionsController {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly redisCacheRepository: IRedisCacheRepository,
    private readonly aiRecommendationProvider: IAIRecommendationProvider
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const userInfoUuid = req.appUser?.user_info_uuid || null;
      const lat = req.query.lat ? Number(req.query.lat) : undefined;
      const lng = req.query.lng ? Number(req.query.lng) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const usecase = new GetRankedMegaPromotionsUsecase(
        this.productRepository,
        this.redisCacheRepository,
        this.aiRecommendationProvider
      );

      const result = await usecase.execute({
        userInfoUuid,
        lat: isNaN(lat as number) ? undefined : lat,
        lng: isNaN(lng as number) ? undefined : lng,
        limit,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[GetRankedMegaPromotionsController] Error:', err);
      return res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error',
      });
    }
  }
}

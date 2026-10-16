import { Request, Response } from 'express';
import { IProductRepository } from '../../repositories/product.repository';
import { IPushNotificationProvider } from '../../../../../infra/providers/PushNotificationProvider/push-notification.provider';
import { IRedisCacheRepository } from '../../../../../infra/redis/redis-cache.repository';
import { SendTargetedMegaPromotionPushUsecase } from './send-targeted-mega-promotion-push.usecase';

export class SendTargetedMegaPromotionPushController {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly pushNotificationProvider: IPushNotificationProvider,
    private readonly redisCacheRepository: IRedisCacheRepository
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const productUuid = req.params.productUuid || req.body.productUuid;
      const maxDistanceKm = req.body.maxDistanceKm ? Number(req.body.maxDistanceKm) : undefined;

      if (!productUuid) {
        return res.status(400).json({ error: 'productUuid é obrigatório' });
      }

      const usecase = new SendTargetedMegaPromotionPushUsecase(
        this.productRepository,
        this.pushNotificationProvider,
        this.redisCacheRepository
      );

      const result = await usecase.execute({
        productUuid,
        maxDistanceKm: isNaN(maxDistanceKm as number) ? undefined : maxDistanceKm,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[SendTargetedMegaPromotionPushController] Error:', err);
      return res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error',
      });
    }
  }
}

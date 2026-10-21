import { ProductPrismaRepository } from '../../repositories/implementations/product-prisma.repository';
import { OneSignalPushNotificationProvider } from '../../../../../infra/providers/PushNotificationProvider/implementations/onesignal-push-notification.provider';
import { RedisCacheRepository } from '../../../../../infra/redis/redis-cache.repository';
import { SendTargetedMegaPromotionPushController } from './send-targeted-mega-promotion-push.controller';

const productRepository = new ProductPrismaRepository();
const pushNotificationProvider = new OneSignalPushNotificationProvider();
const redisCacheRepository = new RedisCacheRepository();

export const sendTargetedMegaPromotionPushController =
  new SendTargetedMegaPromotionPushController(
    productRepository,
    pushNotificationProvider,
    redisCacheRepository
  );

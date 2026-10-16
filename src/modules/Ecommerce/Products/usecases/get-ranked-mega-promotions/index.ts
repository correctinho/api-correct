import { ProductPrismaRepository } from '../../repositories/implementations/product-prisma.repository';
import { RedisCacheRepository } from '../../../../../infra/redis/redis-cache.repository';
import { BedrockRecommendationProvider } from '../../../../../infra/providers/AIProvider/implementations/aws-bedrock/bedrock-recommendation.provider';
import { GetRankedMegaPromotionsController } from './get-ranked-mega-promotions.controller';

const productRepository = new ProductPrismaRepository();
const redisCacheRepository = new RedisCacheRepository();
const aiRecommendationProvider = new BedrockRecommendationProvider();

const getRankedMegaPromotionsController = new GetRankedMegaPromotionsController(
  productRepository,
  redisCacheRepository,
  aiRecommendationProvider
);

export { getRankedMegaPromotionsController };

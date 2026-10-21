import RepositoryInterface from '../../../../@shared/domain/repository/repository-interface';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { ProductHistoryEntity } from '../entities/product-history.entity';
import { ProductEntity } from '../entities/product.entity';

export interface ActiveMegaPromotionItem {
  uuid: string;
  name: string;
  description: string | null;
  brand: string | null;
  original_price: number;
  promotional_price: number;
  discount: number;
  stock: number;
  image_urls: string[];
  product_type: string;
  category_uuid: string;
  category_name?: string | null;
  business_info_uuid: string;
  business_name: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  neighborhood: string | null;
}

export interface UserRecommendationProfile {
  userName: string | null;
  userAddress: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
  } | null;
  favoriteBusinessUuids: string[];
  userBalances: {
    item_name: string;
    balance: number;
  }[];
}

export interface TargetUserCandidate {
  user_info_uuid: string;
  userName: string | null;
  latitude: number | null;
  longitude: number | null;
  hasCategoryBalance: boolean;
  totalBalance: number;
}

export interface MegaPromotionPushContext {
  productUuid: string;
  productName: string;
  discountPercent: number;
  promotionalPrice: number;
  businessInfoUuid: string;
  businessName: string;
  categoryName: string | null;
  partnerLatitude: number | null;
  partnerLongitude: number | null;
}

export interface IProductRepository extends RepositoryInterface<ProductEntity> {
   createProduct(entity: ProductEntity): Promise<ProductEntity>;
   findBusinessProducts(businessInfoUuid: string): Promise<ProductEntity[] | []>;
   findActiveProductsByBusinessId(
      businessInfoUuid: string,
      options: { page: number; limit: number }
   ): Promise<{ products: ProductEntity[], total: number }>;
   delete(entity: ProductEntity): Promise<void>;
   updateWithHistory(entity: ProductEntity, history: ProductHistoryEntity[]): Promise<void>;
   hasBookableServices(businessUuid: Uuid): Promise<boolean>;
   findActiveMegaPromotions(): Promise<ActiveMegaPromotionItem[]>;
   getUserRecommendationProfile(userInfoUuid: string): Promise<UserRecommendationProfile>;
   findTargetUsersForMegaPromotion(
     productUuid: string
   ): Promise<{ users: TargetUserCandidate[]; promotion: MegaPromotionPushContext | null }>;
}

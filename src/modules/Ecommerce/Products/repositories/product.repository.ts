
import RepositoryInterface from '../../../../@shared/domain/repository/repository-interface';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { ProductHistoryEntity } from '../entities/product-history.entity';
import { ProductEntity } from '../entities/product.entity';

export interface IProductRepository extends RepositoryInterface<ProductEntity> {
   createProduct(entity: ProductEntity): Promise<ProductEntity>
   //upsert(entity: ProductEntity): Promise<ProductEntity>;
   findBusinessProducts(businessInfoUuid: string): Promise<ProductEntity[] | []>;
   findActiveProductsByBusinessId(
      businessInfoUuid: string,
      options: { page: number; limit: number }
   ): Promise<{ products: ProductEntity[], total: number }>; delete(entity: ProductEntity): Promise<void>;
   updateWithHistory(entity: ProductEntity, history: ProductHistoryEntity[]): Promise<void>;
   hasBookableServices(businessUuid: Uuid): Promise<boolean>;
}

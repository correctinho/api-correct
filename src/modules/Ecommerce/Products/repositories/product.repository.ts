
import RepositoryInterface from '../../../../@shared/domain/repository/repository-interface';
import { ProductEntity } from '../entities/product.entity';

export interface IProductRepository extends RepositoryInterface<ProductEntity> {
   createProduct(entity: ProductEntity): Promise<ProductEntity>
   upsert(entity: ProductEntity): Promise<ProductEntity>;
   findBusinessProducts(businessInfoUuid: string): Promise<ProductEntity[] | []>;
   findActiveProductsByBusinessId(businessInfoUuid: string): Promise<ProductEntity[] | []>;
   delete(entity: ProductEntity): Promise<void>;
}


import RepositoryInterface from '../../../../@shared/domain/repository/repository-interface';
import { ProductEntity } from '../entities/products.entity';

export interface IProductRepository extends RepositoryInterface<ProductEntity> {
   upsert(entity: ProductEntity): Promise<ProductEntity>;
   findBusinessProducts(businessInfoUuid: string): Promise<ProductEntity[] | []>;
}

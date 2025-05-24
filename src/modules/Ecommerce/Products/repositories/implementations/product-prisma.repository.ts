import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { ProductEntity } from '../../entities/products.entity';
import { IProductRepository } from '../product.repository';

export class ProductPrismaRepository implements IProductRepository {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(entity: ProductEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(entity: ProductEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  find(id: Uuid): Promise<ProductEntity> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<ProductEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findBusinessProducts(
    businessInfoUuid: string,
  ): Promise<ProductEntity[] | []> {
    const products = await prismaClient.products.findMany({
      where: {
        business_info_uuid: businessInfoUuid,
        //is_active: true,
      },
      orderBy: [
        {
          is_mega_promotion: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    });
    return products.map((product) => ({
      uuid: new Uuid(product.uuid),
      category_uuid: new Uuid(product.category_uuid),
      business_info_uuid: new Uuid(product.business_info_uuid),
      brand: product.brand,
      name: product.name,
      description: product.description,
      original_price: product.original_price,
      discount: product.discount,
      promotional_price: product.promotional_price,
      stock: product.stock,
      images_url: product.image_urls,
      is_mega_promotion: product.is_mega_promotion,
      weight: product.weight,
      height: product.height,
      width: product.width,
      created_at: product.created_at,
    })) as ProductEntity[];
  }
  async upsert(entity: ProductEntity): Promise<ProductEntity> {
    const product = await prismaClient.products.upsert({
      where: {
        uuid: entity.uuid.uuid,
      },
      create: {
        uuid: entity.uuid.uuid,
        category_uuid: entity.category_uuid.uuid,
        ean_code: entity.ean_code,
        brand: entity.brand,
        name: entity.name,
        description: entity.description,
        original_price: entity.original_price,
        promotional_price: entity.promotional_price,
        discount: entity.discount,
        image_urls: entity.images_url,
        is_mega_promotion: entity.is_mega_promotion,
        stock: entity.stock,
        weight: entity.weight,
        height: entity.height,
        width: entity.width,
        business_info_uuid: entity.business_info_uuid.uuid,
        created_at: entity.created_at,
      },
      update: {
        category_uuid: entity.category_uuid.uuid,
        ean_code: entity.ean_code,
        brand: entity.brand,
        name: entity.name,
        description: entity.description,
        original_price: entity.original_price,
        promotional_price: entity.promotional_price,
        discount: entity.discount,
        image_urls: entity.images_url,
        is_mega_promotion: entity.is_mega_promotion,
        stock: entity.stock,
        weight: entity.weight,
        height: entity.height,
        width: entity.width,
        updated_at: entity.updated_at,
      },
    });

    return {
      uuid: new Uuid(product.uuid),
      category_uuid: new Uuid(product.category_uuid),
      business_info_uuid: new Uuid(product.business_info_uuid),
      ean_code: product.ean_code,
      brand: product.brand,
      name: product.name,
      description: product.description,
      original_price: product.original_price,
      discount: product.discount,
      promotional_price: product.promotional_price,
      stock: product.stock,
      images_url: product.image_urls,
      is_mega_promotion: product.is_mega_promotion,
      is_active: product.is_active,
      weight: product.weight,
      height: product.height,
      width: product.width,
      created_at: product.created_at,
      updated_at: product.updated_at,
    } as ProductEntity;
  }
}

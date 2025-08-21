import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { ProductEntity, ProductProps } from '../../entities/product.entity';
import { IProductRepository } from '../product.repository';

export class ProductPrismaRepository implements IProductRepository {

  create(entity: ProductEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(entity: ProductEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async find(id: Uuid): Promise<ProductEntity> {
    const product = prismaClient.products.findUnique({
      where: {
        uuid: id.uuid,
      },
    });
    if (!product) return null

    return product.then((prod) => {
      if (!prod) {
        throw new Error('Product not found');
      }
      return {
        uuid: new Uuid(prod.uuid),
        category_uuid: new Uuid(prod.category_uuid),
        business_info_uuid: new Uuid(prod.business_info_uuid),
        ean_code: prod.ean_code,
        brand: prod.brand,
        name: prod.name,
        description: prod.description,
        original_price: prod.original_price,
        discount: prod.discount,
        promotional_price: prod.promotional_price,
        stock: prod.stock,
        image_urls: prod.image_urls,
        is_mega_promotion: prod.is_mega_promotion,
        is_active: prod.is_active,
        weight: prod.weight,
        height: prod.height,
        width: prod.width,
        created_at: prod.created_at,
        updated_at: prod.updated_at,
      } as ProductEntity;
    }
    );
  }
  findAll(): Promise<ProductEntity[]> {
    throw new Error('Method not implemented.');
  }
  async createProduct(entity: ProductEntity): Promise<ProductEntity> {
    const dataToSave = entity.toJSON();
    const createdProductData = await prismaClient.products.create({
      data: dataToSave,
    });

    // CRUCIAL: Após criar, reconstruímos a entidade para retornar uma instância de classe completa.
    const productProps: ProductProps = {
      uuid: new Uuid(createdProductData.uuid),
      category_uuid: new Uuid(createdProductData.category_uuid),
      business_info_uuid: new Uuid(createdProductData.business_info_uuid),
      ean_code: createdProductData.ean_code,
      brand: createdProductData.brand,
      name: createdProductData.name,
      description: createdProductData.description,
      original_price: createdProductData.original_price,
      discount: createdProductData.discount,
      promotional_price: createdProductData.promotional_price,
      stock: createdProductData.stock,
      image_urls: createdProductData.image_urls,
      is_mega_promotion: createdProductData.is_mega_promotion,
      is_active: createdProductData.is_active,
      created_at: createdProductData.created_at,
      updated_at: createdProductData.updated_at,
      weight: createdProductData.weight,
      height: createdProductData.height,
      width: createdProductData.width,
    };

    return ProductEntity.hydrate(productProps);
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
      is_active: product.is_active,
      stock: product.stock,
      image_urls: product.image_urls,
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
        image_urls: entity.image_urls,
        is_mega_promotion: entity.is_mega_promotion,
        is_active: entity.is_active,
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
        image_urls: entity.image_urls,
        is_mega_promotion: entity.is_mega_promotion,
        is_active: entity.is_active,
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
      image_urls: product.image_urls,
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

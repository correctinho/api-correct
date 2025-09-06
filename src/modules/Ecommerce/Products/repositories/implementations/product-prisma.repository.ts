import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { ProductHistoryEntity } from '../../entities/product-history.entity';
import { ProductEntity, ProductProps } from '../../entities/product.entity';
import { IProductRepository } from '../product.repository';

export class ProductPrismaRepository implements IProductRepository {
  async updateWithHistory(entity: ProductEntity, history: ProductHistoryEntity[]): Promise<void> {
    // 1. Preparamos os dados para a persistência usando o método .toJSON() de cada entidade.
    const productDataToSave = entity.toJSON();
    const historyDataToSave = history.map(h => h.toJSON());

    // 2. Usamos o '$transaction' do Prisma para garantir que ambas as operações
    //    (ou todas) sejam bem-sucedidas, ou nenhuma delas seja aplicada.

    await prismaClient.$transaction([
      // Operação 1: Atualiza o produto na tabela 'products'
      prismaClient.products.update({
        where: { uuid: productDataToSave.uuid },
        data: productDataToSave,
      }),

      // Operação 2: Cria os múltiplos registros de histórico na tabela 'product_history'
      prismaClient.productHistory.createMany({
        data: historyDataToSave,
      })
    ]);

  }
  async delete(entity: ProductEntity): Promise<void> {
    const data = entity.toJSON();
    await prismaClient.products.update({
      where: {
        uuid: data.uuid,
      },
      data: {
        is_active: data.is_active,
        deleted_at: data.deleted_at,
        deleted_by_uuid: data.deleted_by_uuid,
        updated_at: data.updated_at,
      },
    });
  }

  create(entity: ProductEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async update(entity: ProductEntity): Promise<void> {
    // 1. Usamos .toJSON() para obter os dados brutos e internos da entidade,
    //    garantindo que estamos passando os valores corretos (ex: preços em centavos) para o banco.
    const dataToSave = entity.toJSON();

    await prismaClient.products.update({
      where: {
        uuid: dataToSave.uuid,
        deleted_at: null, // Garantimos que não estamos atualizando um produto deletado
      },
      data: {
        // Passamos apenas os campos que podem ser atualizados.
        // UUIDs de relacionamento e data de criação geralmente não são alterados.
        name: dataToSave.name,
        description: dataToSave.description,
        ean_code: dataToSave.ean_code,
        brand: dataToSave.brand,
        original_price: dataToSave.original_price,
        discount: dataToSave.discount,
        promotional_price: dataToSave.promotional_price,
        stock: dataToSave.stock,
        image_urls: dataToSave.image_urls,
        is_mega_promotion: dataToSave.is_mega_promotion,
        is_active: dataToSave.is_active,
        weight: dataToSave.weight,
        height: dataToSave.height,
        width: dataToSave.width,
        updated_at: dataToSave.updated_at, // O método .touch() na entidade já atualizou esta data
      },
    });
  }
  async find(id: Uuid): Promise<ProductEntity | null> {
    // 1. Busca os dados brutos da transação no banco de dados
    const productData = await prismaClient.products.findUnique({
      where: {
        uuid: id.uuid,
        deleted_at: null,
      },
    });

    if (!productData) {
      return null;
    }

    // 2. Prepara as 'props' para a hidratação, convertendo strings para Value Objects
    const productProps: ProductProps = {
      uuid: new Uuid(productData.uuid),
      category_uuid: new Uuid(productData.category_uuid),
      business_info_uuid: new Uuid(productData.business_info_uuid),
      created_by_uuid: new Uuid(productData.created_by_uuid),
      updated_by_uuid: new Uuid(productData.updated_by_uuid),
      product_type: productData.product_type,
      ean_code: productData.ean_code,
      brand: productData.brand,
      name: productData.name,
      description: productData.description,
      original_price: productData.original_price,
      discount: productData.discount,
      promotional_price: productData.promotional_price,
      stock: productData.stock,
      image_urls: productData.image_urls,
      is_mega_promotion: productData.is_mega_promotion,
      is_active: productData.is_active,
      weight: productData.weight,
      height: productData.height,
      width: productData.width,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
    };

    // 3. Usa o método estático 'hydrate' para reconstruir a entidade completa.
    //    Isso garante que o objeto retornado seja uma instância de classe real,
    //    com todos os seus métodos (como .setImagesUrl() e .toJSON()).
    return ProductEntity.hydrate(productProps);
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
      created_by_uuid: new Uuid(createdProductData.created_by_uuid),
      updated_by_uuid: new Uuid(createdProductData.updated_by_uuid),
      ean_code: createdProductData.ean_code,
      product_type: createdProductData.product_type,
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
  async findBusinessProducts(businessInfoUuid: string): Promise<ProductEntity[]> {
    const productsData = await prismaClient.products.findMany({
      where: {
        business_info_uuid: businessInfoUuid,
        deleted_at: null,
        // is_active: true, // Mantido comentado para o parceiro ver seus próprios produtos inativos
      },
      orderBy: [
        { is_mega_promotion: 'desc' },
        { created_at: 'desc' },
      ],
    });

    if (!productsData || productsData.length === 0) {
      return [];
    }

    // Mapeamos os dados brutos do banco para reconstruir nossas Entidades de Domínio.
    return productsData.map((product) => {
      const productProps: ProductProps = {
        uuid: new Uuid(product.uuid),
        category_uuid: new Uuid(product.category_uuid),
        business_info_uuid: new Uuid(product.business_info_uuid),
        created_by_uuid: new Uuid(product.created_by_uuid),
        updated_by_uuid: new Uuid(product.updated_by_uuid),
        brand: product.brand,
        product_type: product.product_type,
        name: product.name,
        description: product.description,
        original_price: product.original_price,
        discount: product.discount,
        promotional_price: product.promotional_price,
        stock: product.stock,
        image_urls: product.image_urls,
        is_mega_promotion: product.is_mega_promotion,
        is_active: product.is_active,
        ean_code: product.ean_code,
        weight: product.weight,
        height: product.height,
        width: product.width,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };
      // Usamos o método estático 'hydrate' para retornar uma instância de classe real.
      return ProductEntity.hydrate(productProps);
    });
  }
  async findActiveProductsByBusinessId(
    businessInfoUuid: string,
    options: { page: number; limit: number }
  ): Promise<{ products: ProductEntity[], total: number }> {

    // Calcula os parâmetros para a consulta do Prisma
    const take = options.limit;
    const skip = (options.page - 1) * options.limit;

    // Condições de busca que serão usadas tanto para a listagem quanto para a contagem
    const whereConditions = {
      business_info_uuid: businessInfoUuid,
      is_active: true,
      deleted_at: null as Date | null,
    };

    // Usamos uma transação para executar a busca e a contagem de forma atômica
    const [productsData, total] = await prismaClient.$transaction([
      prismaClient.products.findMany({
        where: whereConditions,
        orderBy: [
          { is_mega_promotion: 'desc' },
          { created_at: 'desc' },
        ],
        skip: skip,
        take: take,
      }),
      prismaClient.products.count({
        where: whereConditions,
      })
    ]);

    if (!productsData || productsData.length === 0) {
      return { products: [], total: 0 };
    }

    // A lógica de hidratação permanece a mesma
    const products = productsData.map(product => {
      // Mapeamento explícito dos dados do Prisma para as props da entidade
      const productProps: ProductProps = {
        uuid: new Uuid(product.uuid),
        category_uuid: new Uuid(product.category_uuid),
        business_info_uuid: new Uuid(product.business_info_uuid),
        created_by_uuid: new Uuid(product.created_by_uuid),
        updated_by_uuid: new Uuid(product.updated_by_uuid),
        product_type: product.product_type,
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
        deleted_at: product.deleted_at,
        deleted_by_uuid: product.deleted_by_uuid ? new Uuid(product.deleted_by_uuid) : null,
        created_at: product.created_at,
        updated_at: product.updated_at,
        weight: product.weight ?? undefined,
        height: product.height ?? undefined,
        width: product.width ?? undefined,
      };

      // Hidrata a entidade de domínio com as props mapeadas
      return ProductEntity.hydrate(productProps);
    });

    return { products, total };
  }
  // async findActiveProductsByBusinessId(businessInfoUuid: string): Promise<ProductEntity[]> {
  //   const productsData = await prismaClient.products.findMany({
  //     where: {
  //       business_info_uuid: businessInfoUuid,
  //       is_active: true, // A chave da lógica está aqui
  //       deleted_at: null,
  //     },
  //     orderBy: [
  //       { is_mega_promotion: 'desc' },
  //       { created_at: 'desc' },
  //     ],
  //   });

  //   if (!productsData || productsData.length === 0) {
  //     return [];
  //   }

  //   // Mapeamos os dados brutos do banco para reconstruir nossas Entidades de Domínio.
  //   return productsData.map(product => {
  //     const productProps: ProductProps = {
  //       uuid: new Uuid(product.uuid),
  //       category_uuid: new Uuid(product.category_uuid),
  //       business_info_uuid: new Uuid(product.business_info_uuid),
  //       created_by_uuid: new Uuid(product.created_by_uuid),
  //       updated_by_uuid: new Uuid(product.updated_by_uuid),
  //       product_type: product.product_type,
  //       ean_code: product.ean_code,
  //       brand: product.brand,
  //       name: product.name,
  //       description: product.description,
  //       original_price: product.original_price,
  //       discount: product.discount,
  //       promotional_price: product.promotional_price,
  //       stock: product.stock,
  //       image_urls: product.image_urls,
  //       is_mega_promotion: product.is_mega_promotion,
  //       is_active: product.is_active,
  //       weight: product.weight,
  //       height: product.height,
  //       width: product.width,
  //       created_at: product.created_at,
  //       updated_at: product.updated_at,
  //     };
  //     return ProductEntity.hydrate(productProps);
  //   });
  // }
  // async upsert(entity: ProductEntity): Promise<ProductEntity> {
  //   const product = await prismaClient.products.upsert({
  //     where: {
  //       uuid: entity.uuid.uuid,
  //     },
  //     create: {
  //       uuid: entity.uuid.uuid,
  //       category_uuid: entity.category_uuid.uuid,
  //       ean_code: entity.ean_code,
  //       brand: entity.brand,
  //       name: entity.name,
  //       description: entity.description,
  //       original_price: entity.original_price,
  //       promotional_price: entity.promotional_price,
  //       discount: entity.discount,
  //       image_urls: entity.image_urls,
  //       is_mega_promotion: entity.is_mega_promotion,
  //       is_active: entity.is_active,
  //       stock: entity.stock,
  //       weight: entity.weight,
  //       height: entity.height,
  //       width: entity.width,
  //       business_info_uuid: entity.business_info_uuid.uuid,
  //       created_at: entity.created_at,
  //     },
  //     update: {
  //       category_uuid: entity.category_uuid.uuid,
  //       ean_code: entity.ean_code,
  //       brand: entity.brand,
  //       name: entity.name,
  //       description: entity.description,
  //       original_price: entity.original_price,
  //       promotional_price: entity.promotional_price,
  //       discount: entity.discount,
  //       image_urls: entity.image_urls,
  //       is_mega_promotion: entity.is_mega_promotion,
  //       is_active: entity.is_active,
  //       stock: entity.stock,
  //       weight: entity.weight,
  //       height: entity.height,
  //       width: entity.width,
  //       updated_at: entity.updated_at,
  //     },
  //   });

  //   return {
  //     uuid: new Uuid(product.uuid),
  //     category_uuid: new Uuid(product.category_uuid),
  //     business_info_uuid: new Uuid(product.business_info_uuid),
  //     ean_code: product.ean_code,
  //     brand: product.brand,
  //     name: product.name,
  //     description: product.description,
  //     original_price: product.original_price,
  //     discount: product.discount,
  //     promotional_price: product.promotional_price,
  //     stock: product.stock,
  //     image_urls: product.image_urls,
  //     is_mega_promotion: product.is_mega_promotion,
  //     is_active: product.is_active,
  //     weight: product.weight,
  //     height: product.height,
  //     width: product.width,
  //     created_at: product.created_at,
  //     updated_at: product.updated_at,
  //   } as ProductEntity;
  // }
}

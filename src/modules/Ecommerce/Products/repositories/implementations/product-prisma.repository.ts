import redisClient from '../../../../../infra/redis/redis.client';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { ProductHistoryEntity } from '../../entities/product-history.entity';
import { ProductEntity, ProductProps } from '../../entities/product.entity';
import { IProductRepository, ActiveMegaPromotionItem, UserRecommendationProfile, TargetUserCandidate, MegaPromotionPushContext } from '../product.repository';

export class ProductPrismaRepository implements IProductRepository {

  private async invalidateMegaPromoCache(): Promise<void> {
    try {
      const keys = await redisClient.keys('mega_promo_feed:*');
      if (keys && keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      console.warn('[ProductPrismaRepository] Erro ao invalidar cache de mega promoções:', err);
    }
  }

  async hasBookableServices(businessUuid: Uuid): Promise<boolean> {
    // Conta quantos produtos do tipo BOOKABLE_SERVICE essa empresa tem.
    const count = await prismaClient.products.count({
      where: {
        business_info_uuid: businessUuid.uuid,
        product_type: 'BOOKABLE_SERVICE',
        is_active: true
      }
    });

    // Se a contagem for maior que 0, retorna true.
    return count > 0;
  }
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
    if (dataToSave.is_mega_promotion) {
      this.invalidateMegaPromoCache();
    }
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
    if (createdProductData.is_mega_promotion) {
      this.invalidateMegaPromoCache();
    }

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

  async findActiveMegaPromotions(): Promise<ActiveMegaPromotionItem[]> {
    const products = await prismaClient.products.findMany({
      where: {
        is_mega_promotion: true,
        is_active: true,
        deleted_at: null,
        stock: { gt: 0 },
        Businessinfo: {
          status: 'active',
        },
      },
      include: {
        Businessinfo: {
          select: {
            uuid: true,
            fantasy_name: true,
            corporate_reason: true,
            PartnerConfig: {
              select: {
                title: true,
                DispatchAddress: {
                  select: {
                    city: true,
                    neighborhood: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
            Address: {
              select: {
                city: true,
                neighborhood: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
        Categories: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
      orderBy: [
        { discount: 'desc' },
        { created_at: 'desc' },
      ],
      take: 50,
    });

    return products.map((p) => {
      const partnerConfig = p.Businessinfo?.PartnerConfig?.[0];
      // DispatchAddress é o endereço base/despacho do parceiro. Fallback: Address cadastral
      const address = (partnerConfig?.DispatchAddress as any) || (p.Businessinfo as any)?.Address;
      const businessName =
        partnerConfig?.title ||
        p.Businessinfo?.fantasy_name ||
        p.Businessinfo?.corporate_reason ||
        'Parceiro';

      return {
        uuid: p.uuid,
        name: p.name,
        description: p.description,
        brand: p.brand,
        original_price: p.original_price,
        promotional_price: p.promotional_price,
        discount: p.discount > 100 ? Math.round(p.discount / 10000) : p.discount,
        stock: p.stock,
        image_urls: p.image_urls,
        product_type: p.product_type,
        category_uuid: p.category_uuid,
        category_name: p.Categories?.name || null,
        business_info_uuid: p.business_info_uuid,
        business_name: businessName,
        latitude: address?.latitude ?? null,
        longitude: address?.longitude ?? null,
        city: address?.city ?? null,
        neighborhood: address?.neighborhood ?? null,
      };
    });
  }

  async getUserRecommendationProfile(userInfoUuid: string): Promise<UserRecommendationProfile> {
    try {
      const [userInfo, recentTransactions, userItems] = await Promise.all([
        prismaClient.userInfo.findUnique({
          where: { uuid: userInfoUuid },
          select: {
            full_name: true,
            display_name: true,
            Address: {
              select: {
                latitude: true,
                longitude: true,
                city: true,
              },
            },
          },
        }),
        prismaClient.transactions.findMany({
          where: {
            status: 'success',
            OR: [
              { UserItem: { user_info_uuid: userInfoUuid } },
              { favored_user_uuid: userInfoUuid },
            ],
            favored_business_info_uuid: { not: null },
          },
          select: {
            favored_business_info_uuid: true,
          },
          orderBy: { created_at: 'desc' },
          take: 50,
        }),
        prismaClient.userItem.findMany({
          where: {
            user_info_uuid: userInfoUuid,
            status: 'active',
            balance: { gt: 0 },
          },
          select: {
            item_name: true,
            balance: true,
          },
        }),
      ]);

      const favoriteBusinessUuids = Array.from(
        new Set(
          recentTransactions
            .map((t) => t.favored_business_info_uuid)
            .filter((id): id is string => Boolean(id))
        )
      );

      const firstName =
        userInfo?.display_name ||
        userInfo?.full_name?.trim().split(' ')[0] ||
        null;

      return {
        userName: firstName,
        userAddress: userInfo?.Address ? {
          latitude: userInfo.Address.latitude,
          longitude: userInfo.Address.longitude,
          city: userInfo.Address.city,
        } : null,
        favoriteBusinessUuids,
        userBalances: userItems.map((item) => ({
          item_name: item.item_name,
          balance: item.balance / 100,
        })),
      };
    } catch (err) {
      console.error('[ProductPrismaRepository] Error fetching user recommendation profile:', err);
      return {
        userName: null,
        userAddress: null,
        favoriteBusinessUuids: [],
        userBalances: [],
      };
    }
  }

  async findTargetUsersForMegaPromotion(
    productUuid: string
  ): Promise<{ users: TargetUserCandidate[]; promotion: MegaPromotionPushContext | null }> {
    try {
      const product = await prismaClient.products.findUnique({
        where: { uuid: productUuid },
        include: {
          Businessinfo: {
            include: {
              Address: true,
              PartnerConfig: {
                include: {
                  DispatchAddress: true,
                },
              },
            },
          },
          Categories: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!product || !product.is_mega_promotion) {
        return { users: [], promotion: null };
      }

      const partnerConfig = product.Businessinfo?.PartnerConfig?.[0];
      const address = (partnerConfig?.DispatchAddress as any) || (product.Businessinfo as any)?.Address;
      const businessName =
        partnerConfig?.title ||
        product.Businessinfo?.fantasy_name ||
        product.Businessinfo?.corporate_reason ||
        'Parceiro';

      const discountNormalized =
        product.discount > 100 ? Math.round(product.discount / 10000) : product.discount;

      const promotion: MegaPromotionPushContext = {
        productUuid: product.uuid,
        productName: product.name,
        discountPercent: discountNormalized,
        promotionalPrice: product.promotional_price / 100,
        businessInfoUuid: product.business_info_uuid,
        businessName,
        categoryName: product.Categories?.name || null,
        partnerLatitude: address?.latitude ? Number(address.latitude) : null,
        partnerLongitude: address?.longitude ? Number(address.longitude) : null,
      };

      const allUsers = await prismaClient.userInfo.findMany({
        select: {
          uuid: true,
          display_name: true,
          full_name: true,
          Address: {
            select: {
              latitude: true,
              longitude: true,
            },
          },
          UserItem: {
            where: {
              status: 'active',
              balance: { gt: 0 },
            },
            select: {
              item_name: true,
              balance: true,
            },
          },
        },
      });

      const categoryNameLower = (promotion.categoryName || '').toLowerCase();

      const candidateUsers: TargetUserCandidate[] = allUsers.map((u) => {
        const hasBalance = u.UserItem.some((item: any) => {
          const itemLower = item.item_name.toLowerCase();
          if (
            categoryNameLower.includes('alimento') ||
            categoryNameLower.includes('supermercado') ||
            categoryNameLower.includes('mercado')
          ) {
            return itemLower.includes('alimenta') || itemLower.includes('refei');
          }
          if (categoryNameLower.includes('farm') || categoryNameLower.includes('saude')) {
            return itemLower.includes('farm') || itemLower.includes('saude');
          }
          if (categoryNameLower.includes('combustivel') || categoryNameLower.includes('auto')) {
            return itemLower.includes('combust');
          }
          return itemLower.includes(categoryNameLower);
        });

        const totalBalance = u.UserItem.reduce((acc: number, curr: any) => acc + curr.balance, 0) / 100;
        const firstName = u.display_name || u.full_name?.trim().split(' ')[0] || null;

        return {
          user_info_uuid: u.uuid,
          userName: firstName,
          latitude: u.Address?.latitude ? Number(u.Address.latitude) : null,
          longitude: u.Address?.longitude ? Number(u.Address.longitude) : null,
          hasCategoryBalance: hasBalance,
          totalBalance,
        };
      });

      return {
        users: candidateUsers,
        promotion,
      };
    } catch (err) {
      console.error('[ProductPrismaRepository] Error in findTargetUsersForMegaPromotion:', err);
      return { users: [], promotion: null };
    }
  }
}

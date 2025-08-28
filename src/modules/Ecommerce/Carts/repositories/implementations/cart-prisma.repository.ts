import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { ProductEntity, ProductProps } from "../../../Products/entities/product.entity";
import { CartItemEntity } from "../../entities/cart-item.entity";
import { CartEntity } from "../../entities/cart.entity";
import { ICartRepository } from "../cart.repository";

export class CartPrismaRepository implements ICartRepository {
    async findByUserAndBusiness(userId: Uuid, businessId: Uuid): Promise<CartEntity | null> {
        const cartData = await prismaClient.cart.findUnique({
            where: {
                user_info_uuid_business_info_uuid: {
                    user_info_uuid: userId.uuid,
                    business_info_uuid: businessId.uuid,
                },
            },
            include: {
                cartItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cartData) return null;

        const items = cartData.cartItems.map(item => {
            // 1. Preparamos as props para a hidratação do produto
            const productProps: ProductProps = {
                uuid: new Uuid(item.product.uuid),
                category_uuid: new Uuid(item.product.category_uuid),
                business_info_uuid: new Uuid(item.product.business_info_uuid),
                created_by_uuid: new Uuid(item.product.created_by_uuid),
                updated_by_uuid: new Uuid(item.product.updated_by_uuid),
                product_type: item.product.product_type,
                ean_code: item.product.ean_code,
                brand: item.product.brand,
                name: item.product.name,
                description: item.product.description,
                original_price: item.product.original_price,
                discount: item.product.discount,
                promotional_price: item.product.promotional_price,
                stock: item.product.stock,
                image_urls: item.product.image_urls,
                is_mega_promotion: item.product.is_mega_promotion,
                is_active: item.product.is_active,
                deleted_at: item.product.deleted_at,
                deleted_by_uuid: item.product.deleted_by_uuid ? new Uuid(item.product.deleted_by_uuid) : null,
                created_at: item.product.created_at,
                updated_at: item.product.updated_at,
                weight: item.product.weight,
                height: item.product.height,
                width: item.product.width,
            };
            // 2. Criamos uma instância de entidade real
            const productEntity = ProductEntity.hydrate(productProps);
            // 3. Criamos o item do carrinho com a entidade de produto correta
            return CartItemEntity.create({ product: productEntity, quantity: item.quantity });
        });

        return CartEntity.hydrate({
            uuid: new Uuid(cartData.uuid),
            user_info_uuid: new Uuid(cartData.user_info_uuid),
            business_info_uuid: new Uuid(cartData.business_info_uuid),
            items: items,
            created_at: cartData.created_at,
            updated_at: cartData.updated_at,
        });
    }
    async create(cart: CartEntity): Promise<void> {
        const cartJson = cart.toJSON();

        // Mapeamos os itens para o formato que o Prisma espera para uma criação aninhada com relação.
        const itemsData = cart.items.map(item => ( {
            uuid: item.uuid.uuid,
            quantity: item.quantity,
            // Usamos 'connect' para associar ao produto existente.
            product: {
                connect: {
                    uuid: item.product.uuid.uuid
                }
            }
        }));

        await prismaClient.cart.upsert({
            where: { uuid: cartJson.uuid },
            create: {
                uuid: cartJson.uuid,
                user_info_uuid: cartJson.user_info_uuid,
                business_info_uuid: cartJson.business_info_uuid,
                created_at: cartJson.created_at,
                updated_at: cartJson.updated_at,
                cartItems: {
                    create: itemsData,
                },
            },
            update: {
                updated_at: cartJson.updated_at,
                cartItems: {
                    // Deleta os itens antigos e cria os novos para simplificar a lógica de update
                    deleteMany: {},
                    create: itemsData,
                },
            },
        });
    }
    update(entity: CartEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    find(id: Uuid): Promise<CartEntity> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<CartEntity[]> {
        throw new Error("Method not implemented.");
    }
    // Implementação dos métodos do repositório usando Prisma
}
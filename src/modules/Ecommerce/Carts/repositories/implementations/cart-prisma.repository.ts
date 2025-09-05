import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { ProductEntity, ProductProps } from "../../../Products/entities/product.entity";
import { CartItemEntity } from "../../entities/cart-item.entity";
import { CartEntity } from "../../entities/cart.entity";
import { ICartRepository } from "../cart.repository";

export class CartPrismaRepository implements ICartRepository {
    async findCartById(cartId: Uuid): Promise<CartEntity | null> {
        const cartData = await prismaClient.cart.findUnique({
            where: { uuid: cartId.uuid },
            include: {
                business: {
                    select: {
                        fantasy_name: true
                    }
                },
                cartItems: {
                    where: { deleted_at: null },
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cartData) {
            return null;
        }

        // A lógica de hidratação completa que já validamos
        const hydratedItems = cartData.cartItems.map(item => {
            // ... (mapeamento completo das props do produto)
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
                weight: item.product.weight ?? undefined,
                height: item.product.height ?? undefined,
                width: item.product.width ?? undefined,
            };
            const productEntity = ProductEntity.hydrate(productProps);
            return CartItemEntity.hydrate({
                uuid: new Uuid(item.uuid),
                product: productEntity,
                quantity: item.quantity,
            });
        });

        return CartEntity.hydrate({
            uuid: new Uuid(cartData.uuid),
            user_info_uuid: new Uuid(cartData.user_info_uuid),
            business_info_uuid: new Uuid(cartData.business_info_uuid),
            items: hydratedItems,
            created_at: cartData.created_at,
            updated_at: cartData.updated_at,
            business_name: cartData.business.fantasy_name,
        });
    }
    async findAllByUserId(userId: Uuid): Promise<CartEntity[]> {
        const cartsData = await prismaClient.cart.findMany({
            where: { user_info_uuid: userId.uuid },
            include: {
                business: {
                    select: {
                        fantasy_name: true
                    }
                },
                cartItems: {
                    where: { deleted_at: null },
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        if (!cartsData.length) {
            return [];
        }

        // Mapeia e hidrata cada carrinho encontrado para uma instância de CartEntity.
        const cartEntities = cartsData.map(cartData => {
            // Passo 2a: Hidratação completa dos itens do carrinho
            const hydratedItems = cartData.cartItems.map(item => {
                // Mapeamento explícito dos dados do produto para as props da entidade
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
                    weight: item.product.weight ?? undefined,
                    height: item.product.height ?? undefined,
                    width: item.product.width ?? undefined,
                };

                const productEntity = ProductEntity.hydrate(productProps);

                // Hidratação do CartItemEntity, passando a entidade de produto real
                return CartItemEntity.hydrate({
                    uuid: new Uuid(item.uuid),
                    product: productEntity,
                    quantity: item.quantity,
                });
            });

            // Passo 2b: Hidratação da entidade Cart principal
            return CartEntity.hydrate({
                uuid: new Uuid(cartData.uuid),
                user_info_uuid: new Uuid(cartData.user_info_uuid),
                business_info_uuid: new Uuid(cartData.business_info_uuid),
                items: hydratedItems,
                created_at: cartData.created_at,
                updated_at: cartData.updated_at,
                business_name: cartData.business.fantasy_name,
            });
        });

        return cartEntities;
    }

    async findCartByItemId(cartItemId: Uuid): Promise<CartEntity | null> {
        // 1. Buscamos o item do carrinho pelo seu UUID para encontrar o carrinho pai
        const cartItemData = await prismaClient.cartItem.findUnique({
            where: { uuid: cartItemId.uuid, deleted_at: null },
            // Usamos 'include' para trazer o carrinho pai e todos os seus itens de uma só vez, com seus produtos
            include: {
                cart: {
                    include: {
                        cartItems: {
                            where: { deleted_at: null },
                            include: {
                                product: true, // Inclui os dados completos do produto para cada item
                            },
                        },
                    },
                },
            },
        });

        // Se o item não for encontrado, o carrinho também não existe
        if (!cartItemData || !cartItemData.cart) {
            return null;
        }

        const cartData = cartItemData.cart;

        // 2. Hidratação em cascata: Product -> CartItem -> Cart
        const hydratedItems = cartData.cartItems.map(item => {
            // Passo 2a: Mapear os dados brutos do Prisma para ProductProps
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
                weight: item.product.weight ?? undefined,
                height: item.product.height ?? undefined,
                width: item.product.width ?? undefined,
            };

            // Passo 2b: Hidratar a ProductEntity a partir dos dados mapeados
            const productEntity = ProductEntity.hydrate(productProps);

            // Passo 2c: Hidratar a CartItemEntity, passando a ProductEntity real e preservando o UUID do item
            return CartItemEntity.hydrate({
                uuid: new Uuid(item.uuid), // Preservamos o UUID original do item no banco
                product: productEntity,
                quantity: item.quantity
            });
        });

        // 3. Hidratamos o carrinho principal com os itens já devidamente hidratados
        return CartEntity.hydrate({
            uuid: new Uuid(cartData.uuid),
            user_info_uuid: new Uuid(cartData.user_info_uuid),
            business_info_uuid: new Uuid(cartData.business_info_uuid),
            items: hydratedItems,
            created_at: cartData.created_at,
            updated_at: cartData.updated_at,
        });
    }
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
                    where: {
                        deleted_at: null // <<< GARANTE QUE SÓ TRAZEMOS ITENS ATIVOS
                    },
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cartData) return null;

        const items = cartData.cartItems.map(item => {
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
            const productEntity = ProductEntity.hydrate(productProps);

            // >>> A CORREÇÃO FINAL ESTÁ AQUI <<<
            // Devemos usar '.hydrate' para reconstruir o item com seu UUID existente do banco.
            return CartItemEntity.hydrate({
                uuid: new Uuid(item.uuid), // Preserva o UUID original
                product: productEntity,
                quantity: item.quantity
            });
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
    // async create(cart: CartEntity): Promise<void> {
    //     const cartJson = cart.toJSON();

    //     // Mapeamos os itens para o formato que o Prisma espera para uma criação aninhada com relação.
    //     const itemsData = cart.items.map(item => ({
    //         uuid: item.uuid.uuid,
    //         quantity: item.quantity,
    //         // Usamos 'connect' para associar ao produto existente.
    //         product: {
    //             connect: {
    //                 uuid: item.product.uuid.uuid
    //             }
    //         }
    //     }));

    //     await prismaClient.cart.upsert({
    //         where: { uuid: cartJson.uuid },
    //         create: {
    //             uuid: cartJson.uuid,
    //             user_info_uuid: cartJson.user_info_uuid,
    //             business_info_uuid: cartJson.business_info_uuid,
    //             created_at: cartJson.created_at,
    //             updated_at: cartJson.updated_at,
    //             cartItems: {
    //                 create: itemsData,
    //             },
    //         },
    //         update: {
    //             updated_at: cartJson.updated_at,
    //             cartItems: {
    //                 // Deleta os itens antigos e cria os novos para simplificar a lógica de update
    //                 deleteMany: {},
    //                 create: itemsData,
    //             },
    //         },
    //     });
    // }
    async deleteCartItem(itemId: Uuid): Promise<void> {
        await prismaClient.cartItem.update({
            where: {
                uuid: itemId.uuid,
            },
            data: {
                deleted_at: new Date(),
            },
        });
    }


    async create(cart: CartEntity): Promise<void> {
        const cartJson = cart.toJSON();
        const entityItemUuids = cart.items.map(item => item.uuid.uuid);

        // Mapeamos os dados dos itens para o formato do Prisma
        const itemsData = cart.items.map(item => ({
            uuid: item.uuid.uuid,
            product_uuid: item.product.uuid.uuid,
            quantity: item.quantity
        }));

        await prismaClient.cart.upsert({
            where: { uuid: cartJson.uuid },
            // Dados para criar um carrinho novo
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
            // Lógica para atualizar um carrinho existente
            update: {
                updated_at: cartJson.updated_at,
                cartItems: {
                    // Passo 1: Soft-delete dos itens que não estão mais na entidade
                    updateMany: {
                        where: {
                            uuid: { notIn: entityItemUuids },
                            deleted_at: null
                        },
                        data: { deleted_at: new Date() }
                    },
                    // Passo 2: Upsert dos itens que estão na entidade
                    upsert: itemsData.map(item => ({
                        where: { cart_product_unique: { cart_uuid: cartJson.uuid, product_uuid: item.product_uuid } },
                        update: { quantity: item.quantity },
                        create: { uuid: item.uuid, product_uuid: item.product_uuid, quantity: item.quantity },
                    }))
                }
            }
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
// Em: src/modules/Ecommerce/Carts/usecases/get-cart-details/get-cart-details.usecase.ts
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ICartRepository } from "../../repositories/cart.repository";
import { InputGetCartDetailsDTO, OutputGetCartDetailsDTO } from "./dto/get-cart-details.dto";

export class GetCartDetailsUsecase {
    constructor(private readonly cartRepository: ICartRepository) { }

    async execute(input: InputGetCartDetailsDTO): Promise<OutputGetCartDetailsDTO> {
        const cartId = new Uuid(input.cartId);
        const userId = new Uuid(input.userId);

        // 1. Busca o carrinho pelo ID
        const cart = await this.cartRepository.findCartById(cartId);

        // 2. VERIFICAÇÃO DE SEGURANÇA: Garante que o carrinho existe e pertence ao usuário logado.
        if (!cart || cart.user_info_uuid.uuid !== userId.uuid) {
            throw new CustomError("Carrinho não encontrado ou não pertence a este usuário.", 404);
        }

        // 3. Mapeia a Entidade para o DTO de saída
        let isCheckoutReady = true;
        const itemsDto = cart.items.map(item => {
            // Verifica se algum item impede o checkout
            if (item.quantity > item.product.stock || !item.product.is_active) {
                isCheckoutReady = false;
            }
            return {
                itemId: item.uuid.uuid,
                productId: item.product.uuid.uuid,
                name: item.product.name,
                brand: item.product.brand,
                imageUrl: item.product.image_urls[0] || null,
                quantity: item.quantity,
                stock: item.product.stock,
                isActive: item.product.is_active,
                unitPrice: {
                    original: item.product.original_price,
                    promotional: item.product.promotional_price,
                },
                totalPrice: item.total,
            };
        });

        return {
            cartId: cart.uuid.uuid,
            businessInfo: {
                id: cart.business_info_uuid.uuid,
                name: cart.business_name,
            },
            priceSummary: {
                subtotal: cart.total,
                total: cart.total, // Por enquanto, total é igual ao subtotal
            },
            items: itemsDto,
            checkoutReady: isCheckoutReady
        };
    }
}
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { CartEntity } from "../../entities/cart.entity";
import { ICartRepository } from "../../repositories/cart.repository";
import { InputDeleteCartItemDTO, OutputDeleteCartItemDTO } from "./dto/delete-cart-item.dto";

/**
 * Usecase responsável por remover (via soft delete) um item específico
 * do carrinho de um usuário.
 */
export class DeleteCartItemUsecase {
    constructor(
        private readonly cartRepository: ICartRepository
    ) { }

    async execute(input: InputDeleteCartItemDTO): Promise<OutputDeleteCartItemDTO> {
        // 1. Validação de entrada
        if (!input.cartItemId || !input.userId) {
            throw new CustomError("IDs do item e do usuário são obrigatórios.", 400);
        }

        const cartItemId = new Uuid(input.cartItemId);
        const userId = new Uuid(input.userId);

        // 2. Busca o carrinho a partir do ID do item
        const cart = await this.cartRepository.findCartByItemId(cartItemId);

        // 3. VERIFICAÇÃO DE PERMISSÃO: Garante que o carrinho encontrado pertence ao usuário logado.
        if (!cart || cart.user_info_uuid.uuid !== userId.uuid) {
            throw new CustomError("Item do carrinho não encontrado ou não pertence a este usuário.", 404);
        }

        // 4. Delega a lógica de negócio para a entidade do carrinho.
        // O método 'removeItem' irá simplesmente remover o item da sua lista interna '_items'.
        cart.removeItem(cartItemId);

        // 5. Salva o estado atualizado do carrinho.
        // O repositório será responsável por "perceber" que um item sumiu da lista
        // e, em vez de deletá-lo, irá marcá-lo com 'deleted_at'.
        await this.cartRepository.create(cart);

        // 6. Formata e retorna o estado final do carrinho para a API.
        // Reutilizamos a mesma lógica de formatação dos outros use cases.
        const finalCartState = cart.toJSON();
        const itemsMap = new Map(cart.items.map(item => [item.uuid.uuid, item]));

        return {
            cartId: finalCartState.uuid,
            total: cart.total, // O getter da entidade já recalcula o total
            items: finalCartState.items.map(itemData => {
                const cartItem = itemsMap.get(itemData.item_uuid)!; // Sabemos que o item existe no map
                const mainImageUrl = cartItem.product.image_urls.find(url => url.endsWith('thumb.webp')) || null;
                return {
                    itemId: itemData.item_uuid,
                    productId: itemData.product_uuid,
                    name: cartItem.product.name,
                    quantity: itemData.quantity,
                    unitPrice: cartItem.product.promotional_price,
                    totalPrice: cartItem.total,
                    main_image_url: mainImageUrl,
                };
            })
        };
    }
}
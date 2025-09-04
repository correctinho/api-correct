import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { CartEntity } from "../../entities/cart.entity";
import { ICartRepository } from "../../repositories/cart.repository";
import { InputUpdateCartItemQuantityDTO, OutputUpdateCartItemQuantityDTO } from "./dto/update-cart-item-quantity.dto";

/**
 * Usecase responsável por atualizar a quantidade de um item específico
 * no carrinho de um usuário.
 */
export class UpdateCartItemQuantityUsecase {
    constructor(
        private readonly cartRepository: ICartRepository
    ) { }

    async execute(input: InputUpdateCartItemQuantityDTO): Promise<OutputUpdateCartItemQuantityDTO> {
        // 1. Validação de entrada
        if (!input.cartItemId || input.newQuantity === undefined) {
            throw new CustomError("ID do item e nova quantidade são obrigatórios.", 400);
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
        // O método 'updateItemQuantity' já lida com a validação de estoque
        // e com a remoção do item se a quantidade for <= 0.
        cart.updateItemQuantity(cartItemId, input.newQuantity);

        // 5. Salva o estado atualizado do carrinho
        await this.cartRepository.create(cart);

        // 6. Formata e retorna o estado final do carrinho para a API
        const finalCartState = cart.toJSON();
        const itemsMap = new Map(cart.items.map(item => [item.uuid.uuid, item]));

        return {
            cartId: finalCartState.uuid,
            total: finalCartState.total_in_cents / 100,
            items: finalCartState.items.map(itemData => {
                const cartItem = itemsMap.get(itemData.item_uuid);
                const mainImageUrl = cartItem?.product.image_urls.find(url => url.endsWith('thumb.webp')) || null;
                return {
                    itemId: itemData.item_uuid,
                    productId: itemData.product_uuid,
                    name: cartItem?.product.name || '',
                    quantity: itemData.quantity,
                    unitPrice: cartItem?.product.promotional_price || 0,
                    totalPrice: cartItem?.total || 0,
                    main_image_url: mainImageUrl,
                };
            })
        };
    }
}

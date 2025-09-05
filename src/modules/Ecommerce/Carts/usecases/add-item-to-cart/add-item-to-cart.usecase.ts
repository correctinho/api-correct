import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IProductRepository } from "../../../Products/repositories/product.repository";
import { CartEntity } from "../../entities/cart.entity";
import { ICartRepository } from "../../repositories/cart.repository";
import { InputAddItemToCartDTO, OutputAddItemToCartDTO } from "./dto/add-item-to-cart.dto";

export class AddItemToCartUsecase {
    constructor(
        private readonly cartRepository: ICartRepository,
        private readonly productRepository: IProductRepository
    ) { }

    async execute(input: InputAddItemToCartDTO): Promise<OutputAddItemToCartDTO> {
        // 1. Validar e buscar as entidades necessárias
        const product = await this.productRepository.find(new Uuid(input.productId));
        if (!product || !product.is_active) {
            throw new CustomError("Produto não encontrado ou inativo.", 404);
        }
        const userId = new Uuid(input.userId);
        const businessId = new Uuid(input.businessId);

        // 2. Tenta encontrar um carrinho existente ou cria um novo
        const cart = await this.cartRepository.findByUserAndBusiness(userId, businessId)
            || CartEntity.create({
                user_info_uuid: userId,
                business_info_uuid: businessId
            });

        // 3. Delega a lógica de negócio para a entidade do carrinho
        cart.addItem(product, input.quantity);
        // 4. Salva o estado atualizado do carrinho
        await this.cartRepository.create(cart);

        // 5. Formata e retorna o estado final do carrinho para a API
        const finalCartState = cart.toJSON();
        return {
            cartId: finalCartState.uuid,
            total: finalCartState.total_in_cents / 100,
            items: finalCartState.items.map(item => ({
                itemId: item.item_uuid,
                productId: item.product_uuid,
                name: cart.items.find(i => i.uuid.uuid === item.item_uuid)?.product.name || '',
                quantity: item.quantity,
                unitPrice: cart.items.find(i => i.uuid.uuid === item.item_uuid)?.product.promotional_price || 0,
                totalPrice: (cart.items.find(i => i.uuid.uuid === item.item_uuid)?.total || 0),
            }))
        };
    }
}

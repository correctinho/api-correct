import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { ICartRepository } from "../../../repositories/cart.repository";
import { InputGetCartForBusinessDTO, OutputGetCartForBusinessDTO } from "./dto/get-cart-for-business.dto";

/**
 * Usecase responsável por buscar o carrinho de compras ativo de um usuário
 * para uma loja (negócio) específica.
 */
export class GetCartForBusinessUsecase {
    constructor(
        private readonly cartRepository: ICartRepository
    ) {}

    async execute(input: InputGetCartForBusinessDTO): Promise<OutputGetCartForBusinessDTO | null> {
        // 1. Validação de entrada
        if (!input.businessInfoId) {
            throw new CustomError("ID do negócio é obrigatório.", 400);
        }

        const userId = new Uuid(input.userInfoId);
        const businessId = new Uuid(input.businessInfoId);

        // 2. Busca o carrinho usando o método do repositório
        const cart = await this.cartRepository.findByUserAndBusiness(userId, businessId);

        // 3. Se não houver carrinho, retorna nulo.
        if (!cart) {
            return null;
        }

        // 4. Mapeia a entidade do carrinho para o DTO de saída.
        return {
            cartId: cart.uuid.uuid,
            businessInfoId: cart.business_info_uuid.uuid,
            total: cart.total, // O getter da entidade já retorna em Reais
            items: cart.items.map(item => {
                const mainImageUrl = item.product.image_urls.find(url => url.endsWith('thumb.webp')) || null;
                
                return {
                    itemId: item.uuid.uuid,
                    productId: item.product.uuid.uuid,
                    name: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.product.promotional_price, // Getter já retorna em Reais
                    totalPrice: item.total, // Getter já retorna em Reais
                    main_image_url: mainImageUrl
                };
            })
        };
    }
}

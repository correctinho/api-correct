import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ICartRepository } from "../../repositories/cart.repository";
import { InputListUserCartsDTO, OutputListUserCartsDTO } from "./dto/list-user-carts.dto";

/**
 * Usecase responsável por buscar todos os carrinhos de compras ativos
 * de um usuário e retorná-los em um formato resumido.
 */
export class ListUserCartsUsecase {
    constructor(
        // O usecase depende da abstração do repositório, não da implementação.
        private readonly cartRepository: ICartRepository
    ) { }

    async execute(input: InputListUserCartsDTO): Promise<OutputListUserCartsDTO> {
        const userId = new Uuid(input.userId);

        // 1. Delega a busca dos dados para o repositório.
        //    Vamos precisar criar este novo método 'findAllByUserId'.
        const carts = await this.cartRepository.findAllByUserId(userId);

        // 2. Mapeia as entidades de domínio (`CartEntity`) para o DTO de saída.
        //    Esta é a camada de transformação, preparando os dados para a API.
        const output: OutputListUserCartsDTO = carts.map(cart => {
            const items = cart.items;
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

            // Pega as URLs das imagens dos 3 primeiros itens como "thumbnails".
            const itemThumbnails = items
                .slice(0, 3)
                .map(item => item.product.image_urls[0] || null); // Pega a primeira imagem de cada produto

            return {
                cartId: cart.uuid.uuid,
                businessInfo: {
                    id: cart.business_info_uuid.uuid,
                    name: cart.business_name, // Placeholder
                },
                itemCount: itemCount,
                priceSummary: {
                    total: cart.total, // O getter da entidade já nos dá o total calculado.
                },
                itemThumbnails: itemThumbnails,
            };
        });

        return output;
    }
}
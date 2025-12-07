import { IProductRepository } from "../../repositories/product.repository";
import { OutputFindOwnBusinessProductDTO } from "./dto/find-business-products.dto";

export class FindOwnBusinessProductsUsecase {
  constructor(
    // A dependência do companyDataRepository foi removida.
    private readonly productRepository: IProductRepository
  ) { }

  async execute(business_info_uuid: string): Promise<OutputFindOwnBusinessProductDTO[]> {
    // A validação de existência do negócio foi removida,
    // pois o middleware da rota já garante isso.
    // Chama o método do repositório que busca TODOS os produtos, sem filtro de status.
    const products = await this.productRepository.findBusinessProducts(
      business_info_uuid
    );

    if (products.length === 0) return [];
    // Mapeia o resultado para o formato de DTO de gerenciamento.
    return products.map(product => {
      return {
        uuid: product.uuid.uuid,
        name: product.name,
        product_type: product.product_type,
        description: product.description,
        original_price: product.original_price, // Getter já retorna em Reais
        promotional_price: product.promotional_price, // Getter já retorna em Reais
        stock: product.stock,
        brand: product.brand,
        is_active: product.is_active, // Retornamos o status para o parceiro
        created_at: product.created_at,
        // Retornamos todos os tamanhos de imagem para a tela de gerenciamento
        images_url: {
          thumbnail: product.image_urls.filter(image => image.endsWith('thumb.webp')),
          medium: product.image_urls.filter(image => image.endsWith('medium.webp')),
          large: product.image_urls.filter(image => image.endsWith('large.webp')),
        }
        
      };
    });
  }
}
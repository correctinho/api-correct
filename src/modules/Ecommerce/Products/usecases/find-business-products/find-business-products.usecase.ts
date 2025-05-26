import { IProductRepository } from "../../repositories/product.repository";
import { OutputFindBusinessProductDTO } from "./dto/find-business-products.dto";

export class FindBusinessProductsUsecase{
  constructor(
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(business_info_uuid: string): Promise<OutputFindBusinessProductDTO[] | []> {

    // Busca os produtos associados ao administrador do negócio
    const products = await this.productRepository.findBusinessProducts(business_info_uuid);
    if(products.length === 0) return []
    return products.map(product => ({
      uuid: product.uuid.uuid,
      category_uuid: product.category_uuid.uuid,
      brand: product.brand,
      name: product.name,
      description: product.description,
      original_price: product.original_price / 100,
      discount: product.discount,
      promotional_price: product.promotional_price / 100,
      stock: product.stock,
      is_mega_promotion: product.is_mega_promotion,
      weight: product.weight,
      height: product.height,
      width: product.width,
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_active: product.is_active,
      images_url: {
        thumbnail: product.images_url.filter(image => image.endsWith('thumbnail.webp')),
        medium: product.images_url.filter(image => image.endsWith('medium.webp')),
        large: product.images_url.filter(image => image.endsWith('large.webp')),
      }
    }))
  }
}

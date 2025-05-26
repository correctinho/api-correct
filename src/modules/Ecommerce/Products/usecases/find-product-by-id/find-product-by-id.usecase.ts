import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IProductRepository } from "../../repositories/product.repository";
import {  OutputFindProductDTO } from "./dto/find-business-products.dto";

export class FindProductByIdUsecase{
  constructor(
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(product_uuid: string): Promise<OutputFindProductDTO> {

    // Busca os produtos associados ao administrador do negócio
    const product = await this.productRepository.find(new Uuid(product_uuid));
    if(!product) throw new CustomError("Product not found", 404);

    console.log(product);

    return {
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
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
      images_url: {
        thumbnail: product.images_url.filter(image => image.endsWith('thumbnail.webp')),
        medium: product.images_url.filter(image => image.endsWith('medium.webp')),
        large: product.images_url.filter(image => image.endsWith('large.webp')),
      }
    }
  }
}

import { IProductRepository } from "../../repositories/product.repository";
import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { OutputFindPublicProductDTO } from "./dto/find-business-products.dto";

export class FindPublicBusinessProductsUsecase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly companyDataRepository: ICompanyDataRepository
  ) { }

  async execute(business_info_uuid: string): Promise<OutputFindPublicProductDTO[]> { // O DTO de saída pode ser mais específico
    // 1. Valida se a empresa parceira existe e está ativa
    const business = await this.companyDataRepository.findById(business_info_uuid);
    if (!business || business.status !== 'active') {
      throw new CustomError("Parceiro não encontrado ou inativo.", 404);
    }

    // 2. Chama o repositório com o filtro 'onlyActive: true'
    const products = await this.productRepository.findActiveProductsByBusinessId(
      business_info_uuid,
    );

    if (products.length === 0) return [];

    // 3. Mapeia o resultado para o formato de DTO público
    return products.map(product => {
      // Lógica para selecionar a imagem principal (ex: a de tamanho médio)
      const mainImageUrl = product.image_urls.find(image => image.endsWith('medium.webp')) || null;

      return {
        uuid: product.uuid.uuid,
        category_uuid: product.category_uuid.uuid,
        product_type: product.product_type,
        brand: product.brand,
        name: product.name,
        description: product.description,
        original_price: product.original_price, // Getter já retorna em Reais
        discount: product.discount, // Getter já retorna em %
        promotional_price: product.promotional_price, // Getter já retorna em Reais
        stock: product.stock,
        is_mega_promotion: product.is_mega_promotion,
        main_image_url: mainImageUrl
      };
    });
  }
}
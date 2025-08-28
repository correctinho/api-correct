import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../../errors/custom.error';
import { ProductCreateCommand, ProductEntity } from '../../entities/product.entity';
import { IProductRepository } from '../../repositories/product.repository';
import { ICompanyUserRepository } from '../../../../Company/CompanyUser/repositories/company-user.repository';
import { ICategoriesRepository } from '../../../Categories/repositories/categories.repository';
import { InputCreateProductDTO, OutputCreateProductDTO } from './dto/create-product.dto';

/**
 * Usecase responsável APENAS pela criação dos dados de um produto.
 * Não lida com o upload de arquivos.
 */
export class CreateProductUsecase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoriesRepository,
    private readonly businessUserRepository: ICompanyUserRepository,
  ) { }

  async execute(data: InputCreateProductDTO): Promise<OutputCreateProductDTO> {

    const businessUserDetails = await this.businessUserRepository.findById(data.business_user_uuid);
    if (!businessUserDetails || !businessUserDetails.business_info_uuid) {
      throw new CustomError('Usuário de negócio ou empresa associada não encontrado.', 404);
    }

    const category = await this.categoryRepository.find(new Uuid(data.category_uuid));
    if (!category) throw new CustomError('Categoria não encontrada.', 404);

    // O comando de criação agora é mais simples, sem dados de imagem.
    const productCreateCommand: ProductCreateCommand = {
      name: data.name,
      description: data.description,
      created_by_uuid: new Uuid(data.business_user_uuid),
      ean_code: data.ean_code,
      product_type: data.product_type,
      brand: data.brand,
      category_uuid: category.uuid,
      business_info_uuid: businessUserDetails.business_info_uuid,
      original_price: data.original_price, // Espera-se que a conversão para centavos seja feita na entidade
      discount: data.discount,
      stock: data.stock,
      is_mega_promotion: data.is_mega_promotion,
      is_active: data.is_active,
      weight: data.weight,
      height: data.height,
      width: data.width,
    };

    const productEntity = ProductEntity.create(productCreateCommand);

    // O produto é salvo com um array de images_url vazio.
    const savedProduct = await this.productRepository.createProduct(productEntity);

    // Retornamos a entidade completa, incluindo o UUID para o próximo passo do frontend.
    return {
        uuid: savedProduct.uuid.uuid,
        name: savedProduct.name,
        description: savedProduct.description,
        original_price: savedProduct.original_price,
        promotional_price: savedProduct.promotional_price,
        product_type: savedProduct.product_type,
        discount: savedProduct.discount,
        stock: savedProduct.stock,
        images_url: savedProduct.image_urls,
        is_mega_promotion: savedProduct.is_mega_promotion,
        is_active: savedProduct.is_active,
        weight: savedProduct.weight,
        height: savedProduct.height,
        width: savedProduct.width,
        brand: savedProduct.brand,
        created_by_uuid: savedProduct.created_by_uuid.uuid,
        created_at: savedProduct.created_at,
        updated_at: savedProduct.updated_at
    };
  }
}
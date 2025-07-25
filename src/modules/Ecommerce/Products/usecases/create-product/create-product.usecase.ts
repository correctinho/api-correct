import { extname } from 'path';
import { FileDTO, ProductCreateCommand, ProductEntity } from '../../entities/products.entity';
import { IProductRepository } from '../../repositories/product.repository';
import { CustomError } from '../../../../../errors/custom.error';
import { IStorage, UploadResponse } from '../../../../../infra/providers/storage/storage'; // UploadResponse é crucial aqui
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { ICompanyUserRepository } from '../../../../Company/CompanyUser/repositories/company-user.repository';
import { ICategoriesRepository } from '../../../Categories/repositories/categories.repository';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { InputCreateProductDTO, OutputCreateProductDTO } from './dto/create-product.dto';

// Definições de tamanho para as imagens (exemplo)
const IMAGE_SIZES = {
  large: { width: 1200, suffix: 'large' },
  medium: { width: 600, suffix: 'medium' },
  thumbnail: { width: 150, suffix: 'thumb' },
};
const WEBP_QUALITY = 80;


export class CreateProductUsecase {
  constructor(
    private storage: IStorage,
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoriesRepository,
    private readonly businessUserRepository: ICompanyUserRepository,
  ) { }

  private parseAndValidateInteger(valueStr: string | undefined | null, fieldName: string, isOptional: boolean = false): number {
    console.log({ valueStr, fieldName, isOptional });
    if (valueStr === undefined || valueStr === null || valueStr.trim() === "") {
      if (isOptional) return 0;
      throw new CustomError(`${fieldName} is required.`, 400);
    }
    const trimmedValue = valueStr.trim();
    if (!/^-?\d+$/.test(trimmedValue)) {
      throw new CustomError(`Invalid ${fieldName} format. Expected a string representing a whole number. Received: '${valueStr}'`, 400);
    }
    const num = parseInt(trimmedValue, 10);
    if (isNaN(num)) {
      throw new CustomError(`Invalid ${fieldName} format. Could not parse as a whole number. Received: '${valueStr}'`, 400);
    }
    return num;
  }

  private parseAndValidateBoolean(valueStr: string | undefined | null, fieldName: string, isOptional: boolean = false, defaultValue?: boolean): boolean {
    if (valueStr === undefined || valueStr === null || valueStr.trim() === "") {
      if (isOptional) {
        if (defaultValue !== undefined) return defaultValue;
        throw new CustomError(`${fieldName} is optional but received an invalid empty value.`, 400);
      }
      throw new CustomError(`${fieldName} is required.`, 400);
    }
    const lcValue = valueStr.toLowerCase().trim();
    if (lcValue === 'true') return true;
    if (lcValue === 'false') return false;
    throw new CustomError(`Invalid ${fieldName} format. Expected 'true' or 'false'. Received: '${valueStr}'`, 400);
  }

  private async processAndUploadImageVersion(
    originalBuffer: Buffer,
    baseNameForStorage: string, // Ex: business_uuid|image_uuid (sem sufixo de tamanho)
    sizeTag: keyof typeof IMAGE_SIZES | 'original_webp',
    targetWidth?: number,
  ): Promise<UploadResponse> { // Retorna a UploadResponse completa
    let processedBuffer: Buffer;
    // O nome do arquivo final que será armazenado no bucket (incluindo sufixo de tamanho)
    const finalFileNameInBucket = `${baseNameForStorage}_${sizeTag}.webp`;

    const imageProcessor = sharp(originalBuffer).webp({ quality: WEBP_QUALITY });

    if (targetWidth) {
      imageProcessor.resize({ width: targetWidth, fit: 'inside', withoutEnlargement: true });
    }

    processedBuffer = await imageProcessor.toBuffer();

    const fileToUpload: FileDTO = {
      buffer: processedBuffer,
      originalname: finalFileNameInBucket, // Nome do arquivo como será salvo no storage
      mimetype: 'image/webp',
      fieldname: 'image', // Pode ser genérico ou específico se precisar
      size: processedBuffer.length,
      encoding: '', // Geralmente não é necessário para buffers
    };

    // O 'folder' é o diretório principal no bucket, ex: 'products'
    // O `fileToUpload.originalname` já contém o nome completo do arquivo, incluindo identificadores e sufixos
    const uploadResult = await this.storage.upload(fileToUpload, '');

    if (uploadResult.error || !uploadResult.data?.url || !uploadResult.data?.path) {
      throw new CustomError(`Failed to upload processed image ${finalFileNameInBucket}: ${uploadResult.error?.message || 'Unknown upload error or missing URL/path from storage provider'}`, 500);
    }
    return uploadResult; // Retorna a UploadResponse completa (que inclui .data.url e .data.path)
  }

  async execute(data: InputCreateProductDTO): Promise<OutputCreateProductDTO> {

    const promotionalPrice = typeof data.promotional_price !== "number" ? this.parseAndValidateInteger(data.promotional_price, 'Promotional price') : data.promotional_price;
    const discount = typeof data.discount !== "number" ? this.parseAndValidateInteger(data.discount, 'Discount') : data.discount
    const stock = typeof data.stock !== "number" ? this.parseAndValidateInteger(data.stock, 'Stock') : data.stock
    const isMegaPromotion = typeof data.is_mega_promotion !== "boolean" ? this.parseAndValidateBoolean(data.is_mega_promotion, 'Is mega promotion') : data.is_mega_promotion
    const isActive = typeof data.is_active === 'boolean'
      ? data.is_active
      : (data.is_active !== undefined && data.is_active !== null
        ? this.parseAndValidateBoolean(data.is_active, 'Is active', true)
        : data.is_active); const originalPrice = typeof data.original_price !== "number" ? this.parseAndValidateInteger(data.original_price, 'Original price') : data.original_price

    const businessUserDetails = await this.businessUserRepository.findById(data.business_user_uuid);
    if (!businessUserDetails || !businessUserDetails.business_info_uuid) {
      throw new CustomError('Business user or associated business info not found.', 404);
    }

    const category = await this.categoryRepository.find(new Uuid(data.category_uuid));
    if (!category) throw new CustomError('Category not found.', 404);

    const productCreateCommand: ProductCreateCommand = {
      name: data.name,
      description: data.description === undefined ? null : data.description,
      ean_code: data.ean_code === undefined ? null : data.ean_code,
      brand: data.brand === undefined ? null : data.brand,
      category_uuid: category.uuid,
      business_info_uuid: businessUserDetails.business_info_uuid,
      original_price: originalPrice,
      promotional_price: promotionalPrice,
      discount: discount,
      stock: stock,
      is_mega_promotion: isMegaPromotion,
      is_active: isActive as boolean,
      api_image: data.api_image, // URL de imagem externa, se houver
      uploaded_images: data.uploaded_images || [], // Arquivos binários para upload
      weight: data.weight,
      height: data.height,
      width: data.width,
    };

    const productEntity = ProductEntity.create(productCreateCommand);
    const finalImageUrls: string[] = []; // Armazenará as URLs públicas definitivas

    if (productEntity.api_image) { // Se uma URL de imagem externa foi fornecida
      finalImageUrls.push(productEntity.api_image);
    }

    const uploadedImageResponsesForRollback: UploadResponse[] = []; // Guarda as respostas completas para possível rollback
    try {
      if (productEntity.uploaded_images && productEntity.uploaded_images.length > 0) {
        for (const imageFile of productEntity.uploaded_images) {
          if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(imageFile.mimetype.toLowerCase())) { // Adicionado webp como permitido na entrada
            throw new CustomError(`Invalid image type for ${imageFile.originalname}. Only JPEG, PNG, GIF, WEBP are allowed. Received: ${imageFile.mimetype}`, 400);
          }

          // Gera um UUID único para esta imagem original. Todas as suas versões (large, medium, thumb) compartilharão este UUID.
          const imageUniqueId = uuidv4();
          // Constrói o nome base para o arquivo no storage. Inclui o ID do negócio para organização/namespacing.
          const baseNameForStorageVersions = `${businessUserDetails.business_info_uuid.uuid}_${imageUniqueId}`;

          // Processar e fazer upload da versão 'large'
          const largeVersionResponse = await this.processAndUploadImageVersion(
            imageFile.buffer,
            baseNameForStorageVersions,
            'large',
            IMAGE_SIZES.large.width
          );
          finalImageUrls.push(largeVersionResponse.data!.url); // Adiciona a URL pública
          uploadedImageResponsesForRollback.push(largeVersionResponse);

          // Processar e fazer upload da versão 'medium'
          const mediumVersionResponse = await this.processAndUploadImageVersion(
            imageFile.buffer,
            baseNameForStorageVersions,
            'medium',
            IMAGE_SIZES.medium.width
          );
          finalImageUrls.push(mediumVersionResponse.data!.url);
          uploadedImageResponsesForRollback.push(mediumVersionResponse);

          // Processar e fazer upload da versão 'thumbnail'
          const thumbVersionResponse = await this.processAndUploadImageVersion(
            imageFile.buffer,
            baseNameForStorageVersions,
            'thumbnail',
            IMAGE_SIZES.thumbnail.width
          );
          finalImageUrls.push(thumbVersionResponse.data!.url);
          uploadedImageResponsesForRollback.push(thumbVersionResponse);
        }
      }

      productEntity.changeImagesUrl(finalImageUrls); // Define as URLs públicas na entidade do produto
      console.log({ productEntity })
      const savedProduct = await this.productRepository.upsert(productEntity);
      console.log({ savedProduct })
      return {
        uuid: savedProduct.uuid.uuid,
        category_uuid: savedProduct.category_uuid.uuid,
        ean_code: savedProduct.ean_code,
        name: savedProduct.name,
        description: savedProduct.description,
        original_price: savedProduct.original_price,
        discount: savedProduct.discount,
        promotional_price: savedProduct.promotional_price,
        stock: savedProduct.stock,
        images_url: savedProduct.images_url, // Estas são as URLs públicas
        is_mega_promotion: savedProduct.is_mega_promotion,
        is_active: savedProduct.is_active,
        created_at: savedProduct.created_at, // Garante formato ISO string
        updated_at: savedProduct.updated_at, // Garante formato ISO string
        weight: savedProduct.weight,
        height: savedProduct.height,
        width: savedProduct.width,
        brand: savedProduct.brand,
      };
    } catch (error: any) {
      // Rollback: Tentar excluir imagens já enviadas em caso de erro subsequente
      if (uploadedImageResponsesForRollback.length > 0) {
        console.warn('[CREATE PRODUCT ROLLBACK] Attempting to delete uploaded images due to an error...');
        const deletePromises = uploadedImageResponsesForRollback.map(response => {
          // Usa o path relativo (response.data.path) para a operação de delete
          if (response.data?.path) {
            return this.storage.delete(response.data.path).catch(delErr => {
              // Loga o erro mas não impede outras deleções de serem tentadas
              console.error(`[CREATE PRODUCT ROLLBACK] Failed to delete image: ${response.data!.path}`, delErr);
            });
          }
          return Promise.resolve(); // Se não houver path, resolve a promessa
        });
        await Promise.allSettled(deletePromises); // Usa allSettled para garantir que todas as tentativas de delete ocorram
        console.warn('[CREATE PRODUCT ROLLBACK] Image deletion attempt finished.');
      }

      // Re-lançar o erro para ser tratado pelo controller
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('[CreateProductUsecase] Unhandled error during product creation:', error);
      throw new CustomError(error.message || 'Error processing product creation.', error.statusCode || 500);
    }
  }
}

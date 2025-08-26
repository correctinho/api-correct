import { FileDTO, ProductEntity } from '../../entities/product.entity';
import { IProductRepository } from '../../repositories/product.repository';
import { CustomError } from '../../../../../errors/custom.error';
import { IStorage, UploadResponse } from '../../../../../infra/providers/storage/storage';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { ICompanyUserRepository } from '../../../../Company/CompanyUser/repositories/company-user.repository';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { InputUploadProductImagesDTO, OutputUploadProductImagesDTO } from './dto/upload-product-images.dto';
import { ProductHistoryEntity } from '../../entities/product-history.entity';

// Definições de tamanho para as imagens
const IMAGE_SIZES = {
    large: { width: 1200, suffix: 'large' },
    medium: { width: 600, suffix: 'medium' },
    thumbnail: { width: 150, suffix: 'thumb' },
};
const WEBP_QUALITY = 80;

// Tipo para garantir que as chaves de IMAGE_SIZES sejam usadas de forma segura
type ImageSizeTag = keyof typeof IMAGE_SIZES;

/**
 * Usecase focado em receber, processar e fazer o upload de imagens
 * para um produto já existente.
 */
export class UploadProductImagesUsecase {
    constructor(
        private storage: IStorage,
        private readonly productRepository: IProductRepository,
        private readonly businessUserRepository: ICompanyUserRepository
    ) { }

    /**
     * Processa uma única imagem em múltiplas versões e faz o upload de cada uma.
     */
    private async processAndUploadImage(
        originalBuffer: Buffer,
        baseNameForStorage: string,
    ): Promise<{ urls: string[], responses: UploadResponse[] }> {

        const uploadedUrls: string[] = [];
        const uploadResponses: UploadResponse[] = [];

        try {
            for (const sizeTag of Object.keys(IMAGE_SIZES) as ImageSizeTag[]) {
                const sizeConfig = IMAGE_SIZES[sizeTag];
                const finalFileName = `${baseNameForStorage}_${sizeConfig.suffix}.webp`;

                const processedBuffer = await sharp(originalBuffer)
                    .resize({ width: sizeConfig.width, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: WEBP_QUALITY })
                    .toBuffer();

                const fileToUpload: FileDTO = {
                    buffer: processedBuffer,
                    originalname: finalFileName,
                    mimetype: 'image/webp',
                    fieldname: 'image',
                    size: processedBuffer.length,
                    encoding: ''
                };

                const uploadResult = await this.storage.upload(fileToUpload, 'products'); // Salva na pasta 'products'
                if (uploadResult.error || !uploadResult.data?.url) {
                    throw new CustomError(`Falha no upload da imagem ${finalFileName}`, 500);
                }

                uploadedUrls.push(uploadResult.data.url);
                uploadResponses.push(uploadResult);
            }
            return { urls: uploadedUrls, responses: uploadResponses };
        } catch (error) {
            // Rollback: Tenta deletar as imagens que já foram salvas desta mesma chamada
            console.warn('[UPLOAD ROLLBACK] Tentando deletar imagens devido a um erro...');
            const deletePromises = uploadResponses.map(res => this.storage.delete(res.data.path));
            await Promise.allSettled(deletePromises);
            throw error; // Re-lança o erro original
        }
    }

    async execute(data: InputUploadProductImagesDTO): Promise<OutputUploadProductImagesDTO> {
        const product = await this.productRepository.find(new Uuid(data.productId));
        if (!product) {
            throw new CustomError('Produto não encontrado.', 404);
        }
        console.log("\n--- [DIAGNÓSTICO] Verificando o objeto 'product' no Usecase de Upload ---");
        console.log("O objeto 'product' é uma instância de ProductEntity?", product instanceof ProductEntity);
        console.log("Conteúdo do objeto 'product':", product);
        console.log("--- FIM DO DEBUG ---\n");
        // Validação de permissão: Verifica se o produto pertence ao negócio do usuário logado
        const businessUser = await this.businessUserRepository.findById(data.business_user_uuid);
        if (!businessUser || product.business_info_uuid.uuid !== businessUser.business_info_uuid.uuid) {
            throw new CustomError('Permissão negada para modificar este produto.', 403);
        }

        const allUploadedUrls = [...product.image_urls]; // Começa com as URLs existentes
        const historyEntries: ProductHistoryEntity[] = []; // <<< Array para guardar os registros de histórico

        for (const imageFile of data.files) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.mimetype.toLowerCase())) {
                console.warn(`Tipo de imagem inválido pulado: ${imageFile.originalname}`);
                continue; // Pula para a próxima imagem
            }

            const imageUniqueId = uuidv4();
            // Estrutura de pasta: products/{business_uuid}/{product_uuid}/{image_uuid}
            const baseNameForStorage = `${product.business_info_uuid.uuid}/${product.uuid.uuid}/${imageUniqueId}`;

            const { urls } = await this.processAndUploadImage(imageFile.buffer, baseNameForStorage);
            allUploadedUrls.push(...urls);

            historyEntries.push(ProductHistoryEntity.create({
                product_uuid: product.uuid,
                changed_by_uuid: new Uuid(data.business_user_uuid),
                field_changed: 'image_added',
                old_value: null,
                // Guardamos um JSON com as URLs das 3 versões geradas
                new_value: JSON.stringify(urls),
            }));
        }
        if (historyEntries.length === 0) {
            return {
                productId: product.uuid.uuid,
                images_url: product.image_urls,
            };
        }
        // Atualiza a entidade com a lista final de URLs
        product.setImagesUrl(allUploadedUrls);
        product.update({}, new Uuid(data.business_user_uuid)); // Chama update para registrar 'updated_by' e 'updated_at'

        // <<< MUDANÇA CRÍTICA: Usamos o método que salva o histórico atomicamente >>>
        await this.productRepository.updateWithHistory(product, historyEntries);

        return {
            productId: product.uuid.uuid,
            images_url: product.image_urls,
        };
    }
}
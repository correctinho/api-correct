import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IStorage } from "../../../../../infra/providers/storage/storage";
import { ICompanyUserRepository } from "../../../../Company/CompanyUser/repositories/company-user.repository";
import { ProductHistoryEntity } from "../../entities/product-history.entity";
import { IProductRepository } from "../../repositories/product.repository";
import { InputDeleteProductImagesDTO, OutputDeleteProductImagesDTO } from "./dto/delete-product-image.dto";

export class DeleteProductImagesUsecase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly companyUserRepository: ICompanyUserRepository,
        private readonly storage: IStorage
    ) { }
    
    private getPathFromUrl(url: string): string {
        try {
            const urlObject = new URL(url);
            
            // 1. Tenta identificar se é uma URL antiga do Supabase
            const supabasePathSegments = urlObject.pathname.split('/public/');
            if (supabasePathSegments.length > 1) {
                return supabasePathSegments[1];
            }
            
            // 2. Se for uma URL do Cloudflare R2 (https://dominio.com/pasta/arquivo.webp)
            const pathname = urlObject.pathname.startsWith('/') ? urlObject.pathname.substring(1) : urlObject.pathname;
            
            if (pathname) {
                return pathname;
            }

            throw new Error("Formato de URL de storage inválido.");
        } catch (error) {
            console.error("Erro ao extrair caminho da URL:", url, error);
            throw new CustomError("URL de imagem inválida.", 400);
        }
    }

    async execute(input: InputDeleteProductImagesDTO): Promise<OutputDeleteProductImagesDTO> {
        if (!input.urlsToDelete || input.urlsToDelete.length === 0) {
            throw new CustomError("Nenhuma URL de imagem foi fornecida para deleção.", 400);
        }

        const product = await this.productRepository.find(new Uuid(input.productId));
        if (!product) {
            throw new CustomError("Produto não encontrado.", 404);
        }

        // Validação de Permissão
        const businessUser = await this.companyUserRepository.findById(input.businessUserId);
        if (!businessUser || product.business_info_uuid.uuid !== businessUser.business_info_uuid.uuid) {
            throw new CustomError("Acesso negado.", 403);
        }

        const historyEntries: ProductHistoryEntity[] = [];
        let remainingImages = [...product.image_urls];

        // 1. Deletar as imagens do storage e preparar os registros de histórico
        for (const url of input.urlsToDelete) {
            
            // Queremos deletar todas as variações da imagem (large, medium, thumb)
            // A URL recebida normalmente termina com '_large.webp'. Vamos extrair a base:
            let baseUrl = url;
            if (url.endsWith('_large.webp')) baseUrl = url.replace('_large.webp', '');
            else if (url.endsWith('_medium.webp')) baseUrl = url.replace('_medium.webp', '');
            else if (url.endsWith('_thumb.webp')) baseUrl = url.replace('_thumb.webp', '');
            else if (url.endsWith('.webp')) baseUrl = url.replace('.webp', '');
            
            // Encontra todas as URLs nas imagens do produto que comecem com essa base
            const urlsToDelete = remainingImages.filter(img => img.startsWith(baseUrl));
            
            for (const variationUrl of urlsToDelete) {
                const pathToDelete = this.getPathFromUrl(variationUrl);
                
                try {
                    await this.storage.delete(pathToDelete);

                    // Remove a URL da lista de imagens restantes
                    remainingImages = remainingImages.filter(img => img !== variationUrl);

                    // Cria o registro de histórico para esta deleção
                    historyEntries.push(ProductHistoryEntity.create({
                        product_uuid: product.uuid,
                        changed_by_uuid: new Uuid(input.businessUserId),
                        field_changed: 'image_deleted',
                        old_value: variationUrl, // Registra a URL que foi deletada
                        new_value: null,
                    }));

                } catch (storageError) {
                    console.error(`Falha ao deletar a imagem ${pathToDelete} do storage.`, storageError);
                    // Decide se deve continuar ou parar. Por segurança, paramos.
                    throw new CustomError(`Erro ao processar a deleção da imagem: ${variationUrl}.`, 500);
                }
            }
        }

        if (historyEntries.length === 0) {
            return {
                productId: product.uuid.uuid,
                message: "Nenhuma imagem foi alterada.",
                remainingImages: product.image_urls,
            };
        }

        // 2. Atualiza a entidade com a nova lista de imagens e a auditoria
        product.setImagesUrl(remainingImages);
        product.update({}, new Uuid(input.businessUserId)); // Chama update para registrar 'updated_by' e 'updated_at'

        // 3. Salva o produto e o histórico atomicamente
        await this.productRepository.updateWithHistory(product, historyEntries);

        return {
            productId: product.uuid.uuid,
            message: `${historyEntries.length} imagem(ns) deletada(s) com sucesso.`,
            remainingImages: product.image_urls,
        };
    }
}

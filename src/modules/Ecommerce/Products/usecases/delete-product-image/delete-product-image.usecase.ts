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
            // A lógica exata aqui depende da estrutura da sua URL do Supabase.
            // Geralmente, o path é tudo após o nome do bucket.
            // Ex: https://<...>.supabase.co/storage/v1/object/public/products/path/to/file.webp
            // Precisamos extrair "products/path/to/file.webp"
            const pathSegments = urlObject.pathname.split('/public/');
            if (pathSegments.length > 1) {
                return pathSegments[1];
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
        const remainingImages = [...product.image_urls];

        // 1. Deletar as imagens do storage e preparar os registros de histórico
        for (const url of input.urlsToDelete) {
            const pathToDelete = this.getPathFromUrl(url);
            
            try {
                await this.storage.delete(pathToDelete);

                // Remove a URL da lista de imagens restantes
                const index = remainingImages.indexOf(url);
                if (index > -1) {
                    remainingImages.splice(index, 1);
                }

                // Cria o registro de histórico para esta deleção
                historyEntries.push(ProductHistoryEntity.create({
                    product_uuid: product.uuid,
                    changed_by_uuid: new Uuid(input.businessUserId),
                    field_changed: 'image_deleted',
                    old_value: url, // Registra a URL que foi deletada
                    new_value: null,
                }));

            } catch (storageError) {
                console.error(`Falha ao deletar a imagem ${pathToDelete} do storage.`, storageError);
                // Decide se deve continuar ou parar. Por segurança, paramos.
                throw new CustomError(`Erro ao processar a deleção da imagem: ${url}.`, 500);
            }
        }

        if (historyEntries.length === 0) {
            // Nenhuma imagem foi realmente deletada (talvez as URLs não existissem no produto)
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

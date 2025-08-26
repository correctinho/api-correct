import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ProductHistoryEntity } from "../../entities/product-history.entity";
import { ProductCreateCommand } from "../../entities/product.entity";
import { IProductRepository } from "../../repositories/product.repository";
import { InputUpdateProductDTO, OutputUpdateProductDTO } from "./dto/update-product.dto";

export class UpdateProductUsecase {
    constructor(
        private readonly productRepository: IProductRepository
    ) { }
    async execute(input: InputUpdateProductDTO): Promise<OutputUpdateProductDTO> {
        const product = await this.productRepository.find(new Uuid(input.productId));
        if (!product) {
            throw new CustomError('Produto não encontrado.', 404);
        }
        if (product.business_info_uuid.uuid !== input.businessInfoId) {
            throw new CustomError('Acesso negado.', 403);
        }

        const historyEntries: ProductHistoryEntity[] = [];

        // 3. COMPARAÇÃO E CRIAÇÃO DE HISTÓRICO
        // <<< CORREÇÃO DE TIPAGEM AQUI >>>
        // Iteramos sobre as chaves do objeto de entrada de forma segura
        for (const key of Object.keys(input.data) as Array<keyof typeof input.data>) {
            // Comparamos o novo valor com o valor antigo (usando os getters para o formato correto)
            if (input.data[key] !== undefined && product[key] !== input.data[key]) {
                historyEntries.push(ProductHistoryEntity.create({
                    product_uuid: product.uuid,
                    changed_by_uuid: new Uuid(input.businessUserId),
                    field_changed: key,
                    old_value: String(product[key]), // Converte o valor antigo para string
                    new_value: String(input.data[key]), // Converte o novo valor para string
                }));
            }
        }

        // Se nenhuma alteração foi detectada, apenas retorna o produto como está.
        if (historyEntries.length === 0) {
            return {
                uuid: product.uuid.uuid,
                name: product.name,
                description: product.description,
                original_price: product.original_price,
                discount: product.discount,
                promotional_price: product.promotional_price,
                stock: product.stock,
                brand: product.brand,
                is_active: product.is_active,
                weight: product.weight,
                height: product.height,
                updated_at: product.updated_at,
                updated_by_uuid: product.updated_by_uuid.uuid,
            };
        }

        // 4. APLICA AS MUDANÇAS NA ENTIDADE
        product.update(input.data as Partial<ProductCreateCommand>, new Uuid(input.businessUserId));

        // 5. SALVA O PRODUTO E O HISTÓRICO ATOMICAMENTE
        await this.productRepository.updateWithHistory(product, historyEntries);

        // 6. RETORNA O DTO DE SAÍDA COM OS DADOS ATUALIZADOS
        return {
            uuid: product.uuid.uuid,
            name: product.name,
            original_price: product.original_price,
            brand: product.brand,
            description: product.description,
            discount: product.discount,
            promotional_price: product.promotional_price,
            height: product.height,
            weight: product.weight,
            stock: product.stock,
            is_active: product.is_active,
            updated_at: product.updated_at,
            updated_by_uuid: product.updated_by_uuid.uuid,
        };
    }
}
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IProductRepository } from "../../repositories/product.repository";
import { InputDeleteProductDTO } from "./dto/delete-product.dto";

export class DeleteProductUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
    ) { }

    async execute(data: InputDeleteProductDTO): Promise<void> {
        // Verifica se o produto existe
        const product = await this.productRepository.find(new Uuid(data.product_uuid));
        if (!product) {
            throw new CustomError("Produto não encontrado.", 404);
        }
        // Verifica se a empresa pdode deletar o produto
        if (product.business_info_uuid.uuid !== data.business_info_uuid) {
            throw new CustomError("A empresa não tem permissão para deletar este produto.", 403);
        }

        // Marca o produto como deletado
        product.delete(new Uuid(data.business_user_uuid));
        await this.productRepository.delete(product)

    }
}
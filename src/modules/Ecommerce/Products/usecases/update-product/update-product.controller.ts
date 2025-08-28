import { Request, Response } from "express";
import { InputUpdateProductDTO } from "./dto/update-product.dto";
import { IProductRepository } from "../../repositories/product.repository";
import { UpdateProductUsecase } from "./update-product.usecase";
export class UpdateProductController {
    constructor(private readonly productRepository: IProductRepository) { }

    async handle(request: Request, response: Response) {
        const productId = request.params.productId;
        const businessUserId = request.companyUser.companyUserId
        const businessInfoId = request.companyUser.businessInfoUuid
        const data = request.body;

        const input: InputUpdateProductDTO = {
            productId,
            businessUserId,
            businessInfoId,
            data,
        };

        try {
            const usecase = new UpdateProductUsecase(this.productRepository);
            const output = await usecase.execute(input);
            return response.status(200).json(output);
        } catch (err: any) {
            return response.status(err.statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
import { Request, Response } from "express";
import { DeleteProductUseCase } from "./delete-product.usecase";
import { IProductRepository } from "../../repositories/product.repository";

export class DeleteProductController {
    constructor(
        private readonly productRepository: IProductRepository,
    ) { }
    async handle(req: Request, res: Response) {
        try {
            const data = req.body
            data.product_uuid = req.params.product_uuid
            data.business_info_uuid = req.companyUser.businessInfoUuid
            data.business_user_uuid = req.companyUser.companyUserId

            const usecase = new DeleteProductUseCase(this.productRepository)

            await usecase.execute(data);
            return res.status(204).send();
       } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
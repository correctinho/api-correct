import { IStorage } from "../../../../../infra/providers/storage/storage";
import { ICompanyUserRepository } from "../../../../Company/CompanyUser/repositories/company-user.repository";
import { IProductRepository } from "../../repositories/product.repository";
import { Request, Response } from "express";
import { DeleteProductImagesUsecase } from "./delete-product-image.usecase";
export class DeleteProductImageController {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly companyUserRepository: ICompanyUserRepository,
        private readonly storage: IStorage
    ) { }

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const businessUserId = req.companyUser.companyUserId;
            const productId = req.params.productId;
            const urlsToDelete = req.body.urlsToDelete;

            const usecase = new DeleteProductImagesUsecase(
                this.productRepository,
                this.companyUserRepository,
                this.storage
            )
            const result = await usecase.execute({
                businessUserId,
                productId,
                urlsToDelete
            });

            return res.status(200).json(result);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
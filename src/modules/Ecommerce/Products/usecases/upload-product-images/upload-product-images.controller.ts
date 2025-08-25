import { Request, Response } from "express";
import { IStorage } from "../../../../../infra/providers/storage/storage";
import { ICompanyUserRepository } from "../../../../Company/CompanyUser/repositories/company-user.repository";
import { IProductRepository } from "../../repositories/product.repository";
import { UploadProductImagesUsecase } from "./upload-product-images.usecase";

export class UploadProductImagesController {
    constructor(
        private storage: IStorage,
        private readonly productRepository: IProductRepository,
        private readonly businessUserRepository: ICompanyUserRepository
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const business_user_uuid = req.companyUser.companyUserId;
            const productId = req.params.product_uuid;
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return res.status(400).json({ error: "No images provided for upload." });
            }

            const usecase = new UploadProductImagesUsecase(
                this.storage,
                this.productRepository,
                this.businessUserRepository
            );

            const result = await usecase.execute({productId, files, business_user_uuid});
            return res.status(200).json(result);
        } catch (err: any) {
            console.log({err})
            return res.status(err.statusCode || 500).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}
import { Request, Response } from "express";
import { IStorage } from "../../../../../infra/providers/storage/storage";
import { ICompanyUserRepository } from "../../../../Company/CompanyUser/repositories/company-user.repository";
import { ICategoriesRepository } from "../../../Categories/repositories/categories.repository";
import { IProductRepository } from "../../repositories/product.repository";
import { CreateProductUsecase } from "./create-product.usecase";

export class CreateProductController {
  constructor(
    private storage: IStorage,
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoriesRepository,
    private readonly businessUserRepository: ICompanyUserRepository,
  ) { }

  async handle(req: Request, res: Response) {
    try {

      const data = req.body;
      data.business_user_uuid = req.companyUser.companyUserId
      data.uploaded_images = req.files as Express.Multer.File[];


      const usecase = new CreateProductUsecase(
        this.storage,
        this.productRepository,
        this.categoryRepository,
        this.businessUserRepository,
      )

      const result = await usecase.execute(data);
      return res.status(201).json(result);
    } catch (err: any) {
      console.log({err})
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}

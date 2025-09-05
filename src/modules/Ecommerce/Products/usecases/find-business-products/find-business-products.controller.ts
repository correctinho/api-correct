import { Request, Response } from "express";
import { IProductRepository } from "../../repositories/product.repository";
import { FindPublicBusinessProductsUsecase } from "./find-public-business-products.usecase";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { FindOwnBusinessProductsUsecase } from "./find-business-pruducts-by-business.usecase";

export class FindBusinessProductsController {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly companyDataRepository: ICompanyDataRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      let products: any = [];
      if (req.params.business_info_uuid) {
        const business_info_uuid = req.params.business_info_uuid;

        const usecase = new FindPublicBusinessProductsUsecase(
          this.productRepository,
          this.companyDataRepository)

        products = await usecase.execute(business_info_uuid);
      } else {
        const business_info_uuid = req.companyUser.businessInfoUuid
        const usecase = new FindOwnBusinessProductsUsecase(
          this.productRepository
        )
        products = await usecase.execute(business_info_uuid);
      }

      return res.status(200).json(products);

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}

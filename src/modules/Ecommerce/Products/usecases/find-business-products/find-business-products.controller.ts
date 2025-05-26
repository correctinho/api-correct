import { Request, Response } from "express";
import { FindBusinessProductsUsecase } from "./find-business-products.usecase";
import { IProductRepository } from "../../repositories/product.repository";

export class FindBusinessProductsController {
  constructor(
      private readonly productRepository: IProductRepository,
    ) {}

  async handle(req: Request, res: Response) {
    try {
      const business_info_uuid = req.params.business_info_uuid;
      const usecase = new FindBusinessProductsUsecase(this.productRepository)

      const products = await usecase.execute(business_info_uuid);
      return res.status(200).json(products);

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}

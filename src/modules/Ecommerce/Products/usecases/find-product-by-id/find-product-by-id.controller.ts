import { Request, Response } from "express";
import {  FindProductByIdUsecase } from "./find-product-by-id.usecase";
import { IProductRepository } from "../../repositories/product.repository";

export class FindProductController {
  constructor(
      private readonly productRepository: IProductRepository,
    ) {}

  async handle(req: Request, res: Response) {
    try {
      const product_uuid = req.params.product_uuid;
      const usecase = new FindProductByIdUsecase(this.productRepository)

      const product = await usecase.execute(product_uuid);
      return res.status(200).json(product);

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}

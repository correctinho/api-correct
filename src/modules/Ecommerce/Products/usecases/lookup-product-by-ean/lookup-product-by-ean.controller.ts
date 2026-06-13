import { Request, Response } from "express";
import { LookupProductByEanUseCase } from "./lookup-product-by-ean.usecase";

export class LookupProductByEanController {
  constructor(private lookupProductByEanUseCase: LookupProductByEanUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { ean } = request.params;
      const product = await this.lookupProductByEanUseCase.execute(ean);
      return response.status(200).json(product);
    } catch (error: any) {
      return response.status(error.statusCode || 500).json({
        message: error.message || "Internal server error"
      });
    }
  }
}

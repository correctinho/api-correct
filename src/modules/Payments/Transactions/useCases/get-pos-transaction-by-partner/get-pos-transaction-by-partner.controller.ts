import { Request, Response } from "express";
import { GetPOSTransactionByPartnerUsecase } from "./get-pos-transaction-by-partner.usecase";

export class GetPOSTransactionByPartnerController {
  constructor(private usecase: GetPOSTransactionByPartnerUsecase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const transactionId = request.params.transactionId;

      const result = await this.usecase.execute({ transactionId });

      return response.status(200).json(result);
    } catch (err: any) {
      return response.status(err.statusCode || 500).json({
        error: err.message || "Unexpected error.",
      });
    }
  }
}

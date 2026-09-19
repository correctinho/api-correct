import { Request, Response } from "express";
import { GetAdminTransactionDetailsUseCase } from "./get-admin-transaction-details.usecase";

export class GetAdminTransactionDetailsController {
  constructor(private getAdminTransactionDetailsUseCase: GetAdminTransactionDetailsUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { transaction_uuid } = req.params;

      const result = await this.getAdminTransactionDetailsUseCase.execute(transaction_uuid);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "Unexpected error."
      });
    }
  }
}

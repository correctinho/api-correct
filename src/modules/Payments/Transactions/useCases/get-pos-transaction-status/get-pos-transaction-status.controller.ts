import { Request, Response } from "express";
import { GetPOSTransactionStatusUseCase } from "./get-pos-transaction-status.usecase";

export class GetPOSTransactionStatusController {
  constructor(
    private readonly getPOSTransactionStatusUseCase: GetPOSTransactionStatusUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { transactionId } = req.params;
      const business_info_uuid = req.companyUser.businessInfoUuid;

      const result = await this.getPOSTransactionStatusUseCase.execute({
        transactionId,
        business_info_uuid,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message || "Internal server error",
      });
    }
  }
}

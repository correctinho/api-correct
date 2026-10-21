import { Request, Response } from "express";
import { CancelSaleByAdminUseCase } from "./cancel-sale-by-admin.usecase";

export class CancelSaleByAdminController {
  constructor(private cancelSaleByAdminUseCase: CancelSaleByAdminUseCase) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { transaction_uuid } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "Motivo do cancelamento é obrigatório (reason)." });
      }

      const result = await this.cancelSaleByAdminUseCase.execute({
        transaction_uuid,
        reason
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.log(error)
      return res.status(error.statusCode || 500).json({
        error: error.message || "Unexpected error."
      });
    }
  }
}

import { Request, Response } from "express";
import { CancelPartnerSaleUseCase } from "./cancel-partner-sale.usecase";

export class CancelPartnerSaleController {
  constructor(private cancelPartnerSaleUseCase: CancelPartnerSaleUseCase) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { transaction_uuid } = req.params;
      const { reason } = req.body;
      const business_info_uuid = req.companyUser.businessInfoUuid;

      if (!reason) {
        return res.status(400).json({ error: "Motivo do cancelamento é obrigatório (reason)." });
      }

      if (!business_info_uuid) {
        return res.status(403).json({ error: "Usuário não possui uma empresa vinculada." });
      }

      const result = await this.cancelPartnerSaleUseCase.execute({
        transaction_uuid,
        business_info_uuid,
        reason
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.log("error controller: ", error)
      return res.status(error.statusCode || 500).json({
        error: error.message || "Unexpected error."
      });
    }
  }
}

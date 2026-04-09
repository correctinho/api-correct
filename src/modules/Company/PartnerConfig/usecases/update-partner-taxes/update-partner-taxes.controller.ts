import { Request, Response } from 'express';
import { UpdatePartnerTaxesUsecase } from './update-partner-taxes.usecase';

export class UpdatePartnerTaxesController {
  constructor(private usecase: UpdatePartnerTaxesUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const business_info_uuid = req.params.uuid;
      const { admin_tax, marketing_tax, market_place_tax, cashback_tax } = req.body;

      await this.usecase.execute({
        business_info_uuid,
        admin_tax: Number(admin_tax),
        marketing_tax: Number(marketing_tax),
        market_place_tax: Number(market_place_tax),
        cashback_tax: Number(cashback_tax)
      });

      return res.status(204).send();
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "Internal Server Error",
      });
    }
  }
}

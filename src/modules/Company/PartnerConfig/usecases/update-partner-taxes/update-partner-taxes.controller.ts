import { Request, Response } from "express";
import { UpdatePartnerTaxesUsecase } from "./update-partner-taxes.usecase";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";
import { GenerateBusinessContractUsecase } from "../../../../Terms/usecase/generate-business-contract/generate-business-contract.usecase";

export class UpdatePartnerTaxesController {
  constructor(
    private repository: IPartnerConfigRepository,
    private businessInfoRepository: ICompanyDataRepository,
    private businessContractRepository: IBusinessContractRepository,
    private generateContractUsecase: GenerateBusinessContractUsecase
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const { admin_tax, marketing_tax, market_place_tax, cashback_tax } = req.body;

      if (!uuid) {
        return res.status(400).json({ error: "UUID do parceiro é obrigatório." });
      }

      const usecase = new UpdatePartnerTaxesUsecase(
        this.repository,
        this.businessInfoRepository,
        this.businessContractRepository,
        this.generateContractUsecase
      );

      await usecase.execute({
        business_info_uuid: uuid,
        admin_tax,
        marketing_tax,
        market_place_tax,
        cashback_tax,
      });

      return res.status(204).send();
    } catch (err: any) {
      console.error("[UpdatePartnerTaxesController] Error:", err);
      return res.status(err.statusCode || 500).json({
        error: err.message,
      });
    }
  }
}

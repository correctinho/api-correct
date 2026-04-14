import { Request, Response } from "express";
import { UpdateDefaultBenefitValueUsecase } from "./update-default-benefit-value.usecase";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";

export class UpdateDefaultBenefitValueController {
  constructor(
    private benefitGroupsRepository: IBenefitGroupsRepository,
    private businessItemDetailsRepository: IBusinessItemDetailsRepository
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { business_info_uuid, item_uuid, value } = req.body;

      const usecase = new UpdateDefaultBenefitValueUsecase(
        this.benefitGroupsRepository,
        this.businessItemDetailsRepository
      );

      await usecase.execute(business_info_uuid, item_uuid, value);

      return res.status(200).json({ message: "Valor de referência atualizado com sucesso" });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        error: err.message || "Unexpected error occurred"
      });
    }
  }
}

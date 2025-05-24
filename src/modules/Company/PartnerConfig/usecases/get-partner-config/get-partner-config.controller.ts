import { Request, Response } from "express";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { GetPartnerConfigByBusinessAdminUsecase } from "./get-partner-config.usecase";

export class GetPartnerConfigByBusinessAdminController {
  constructor(
      private readonly partnerConfigRepository: IPartnerConfigRepository,
    ) {}

  async handle(req: Request, res: Response) {
    try {
      const data = req.body;
      data.business_info_uuid = req.companyUser.businessInfoUuid;

      const usecase = new GetPartnerConfigByBusinessAdminUsecase(this.partnerConfigRepository);
      const result = await usecase.execute(data);
      return res.status(200).json(result);

    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "Internal Server Error",
      });

    }
  }
}

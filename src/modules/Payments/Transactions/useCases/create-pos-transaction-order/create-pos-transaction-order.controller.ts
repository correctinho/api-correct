import { Request, Response } from "express";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { CreatePOSTransactionOrderUsecase } from "./create-pos-transaction-order.usecase";

export class CreatePOSTransactionOrderController {
   constructor(
      private businessInfoRepository: ICompanyDataRepository,
      private transactionOrderRepository: ITransactionOrderRepository,
      private partnerConfigRepository: IPartnerConfigRepository,
    ){}

  async handle(req: Request, res: Response) {
    try {
      const data = req.body;
      data.business_info_uuid = req.companyUser.businessInfoUuid
      data.partner_user_uuid = req.companyUser.companyUserId

      const usecase = new CreatePOSTransactionOrderUsecase(this.businessInfoRepository, this.transactionOrderRepository, this.partnerConfigRepository);


      const result = await usecase.execute(data);

      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }
  }
}

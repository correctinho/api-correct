import { Request, Response } from "express";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { GetPOSTransactionByAppUserUsecase } from "./get-pos-transaction-by-appuser.usecase";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";

export class GetPOSTransactionByAppUserController {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private userItemRepository: IAppUserItemRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
        private businessInfoRepository: ICompanyDataRepository



  ) { }

  async handle(req: Request, res: Response) {
    try {

      const data = req.body
      data.transactionId = req.query.transactionId as string
      data.appUserId = req.appUser.appUserId
      data.appUserInfoID = req.appUser.user_info_uuid

      const usecase = new GetPOSTransactionByAppUserUsecase(
        this.transactionOrderRepository,
        this.userItemRepository,
        this.partnerConfigRepository,
        this.businessInfoRepository);

      const result = await usecase.execute(data);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }
  }
}

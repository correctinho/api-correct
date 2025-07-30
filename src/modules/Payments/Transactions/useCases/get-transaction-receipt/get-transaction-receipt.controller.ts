import { Request, Response } from "express";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { GetTransactionReceiptUsecase } from "./get-transaction-receipt.usecase";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";

export class GetTransactionReceiptController {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository,
    private businessInfoRepository: ICompanyDataRepository,
    private appUserItemRepository: IAppUserItemRepository,
    private appUserInfoRepository: IAppUserInfoRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {

      const data = req.body
      data.transactionId = req.query.transactionId as string

      const usecase = new GetTransactionReceiptUsecase(
        this.transactionOrderRepository,
        this.businessInfoRepository,
        this.appUserItemRepository,
        this.appUserInfoRepository
      )
      const result = await usecase.execute(data);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }
  }
}

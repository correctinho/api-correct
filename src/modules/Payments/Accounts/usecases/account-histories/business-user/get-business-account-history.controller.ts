import { Request, Response } from "express";
import { GetBusinessAccountHistoryUsecase } from "./get-business-account-history.usecase";
import { IAccountsHistoryRepository } from "../../repositories/accounts-history.repository";
import { IBusinessAccountRepository } from "../../repositories/business-account.repository";

export class GetBusinessAccountHistoryController {
  constructor(
    private accountHistoryRepository: IAccountsHistoryRepository,
    private businessAccountRepository: IBusinessAccountRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {

      let data = req.body
      data.business_info_uuid = req.companyUser.businessInfoUuid


      const usecase = new GetBusinessAccountHistoryUsecase(this.accountHistoryRepository, this.businessAccountRepository)

      const result = await usecase.execute(data)

      return res.json(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}

import { IBusinessAccountRepository } from "../../repositories/business-account.repository";
import { Request, Response } from "express";
import { GetBusinessCreditsUsecase } from "./get-business-credits.usecase";
import { IPartnerCreditRepository } from "../../../repositories/partner-credit.repository";
import { ITransactionOrderRepository } from "../../../../Transactions/repositories/transaction-order.repository";
export class GetBusinessCreditsController {
   constructor(
          private readonly partnerCreditRepository: IPartnerCreditRepository,
          private readonly transactionOrderRepository: ITransactionOrderRepository
      ) { }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      
      const business_info_uuid = req.companyUser.businessInfoUuid;
      
      const usecase = new GetBusinessCreditsUsecase(this.partnerCreditRepository, this.transactionOrderRepository);
      const result = await usecase.execute(business_info_uuid);
      return res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}   
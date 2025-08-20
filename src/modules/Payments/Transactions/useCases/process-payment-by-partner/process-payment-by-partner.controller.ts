import { Request, Response } from "express";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { IBusinessAccountRepository } from "../../../Accounts/usecases/repositories/business-account.repository";
import { IPartnerCreditRepository } from "../../../Accounts/repositories/partner-credit.repository";
import { ProcessPaymentByPartnerUsecase } from "./process-payment-by-partner.usecase";

export class ProcessPaymentByPartnerController {
    constructor(
        // O Usecase depende das interfaces dos repositórios
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly businessAccountRepository: IBusinessAccountRepository,
        private readonly partnerCreditRepository: IPartnerCreditRepository
    ) { }
    async handle(req: Request, res: Response) {
        try {
            const data = req.body
            data.transactionId = req.body.transactionId as string
            data.payerBusinessInfoId = req.companyUser.businessInfoUuid

            const usecase = new ProcessPaymentByPartnerUsecase(
                this.transactionRepository,
                this.businessAccountRepository,
                this.partnerCreditRepository
            )
            const result = await usecase.execute(data)

            return res.status(200).json(result)

        } catch (err: any) {
            const statusCode = err.statusCode || 500; // Default para 500 se não houver statusCode
            return res.status(statusCode).json({
                error: err.message || "Internal Server Error", // Mensagem padrão
            });
        }
    }
}
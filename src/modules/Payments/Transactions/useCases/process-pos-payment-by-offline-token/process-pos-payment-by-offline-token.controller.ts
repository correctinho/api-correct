import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ICompanyDataRepository } from "../../../../Company/CompanyData/repositories/company-data.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { IOfflineTokenHistoryRepository } from "../../../OfflineTokens/repositories/offline-tokens-history.repository";
import { IOfflineTokenRepository } from "../../../OfflineTokens/repositories/offline-tokens.repository";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputProcessPOSTransactionWithOfflineTokenDTO } from "./dto/process-pos-payment-by-offline-token.dto";
import { ProcessPOSTransactionWithOfflineTokenUsecase } from "./process-pos-payment-by-offline-token.usecase";

export class  ProcessPOSTransactionWithOfflineTokenController{
    constructor(
        private businessInfoRepository: ICompanyDataRepository,
        private transactionOrderRepository: ITransactionOrderRepository,
        private userItemRepository: IAppUserItemRepository,
        private partnerConfigRepository: IPartnerConfigRepository,
        private offlineTokenRepository: IOfflineTokenRepository,
      ) {}
    
    async handle(req: Request, res: Response){
        try{
            const data:InputProcessPOSTransactionWithOfflineTokenDTO = {
                business_info_uuid: req.companyUser.businessInfoUuid,
                partner_user_uuid: req.companyUser.companyUserId,
                original_price: req.body.original_price,
                net_price: req.body.net_price,
                discount_percentage: req.body.discount_percentage,
                tokenCode: req.body.tokenCode
            }
            const usecase = new ProcessPOSTransactionWithOfflineTokenUsecase(
                this.businessInfoRepository,
                this.transactionOrderRepository,
                this.userItemRepository,
                this.partnerConfigRepository,
                this.offlineTokenRepository,
            )


            const result = await usecase.execute(data)

            return res.status(200).json(result)

        }catch(err: any){
        const statusCode = err.statusCode || 500; // Default para 500 se não houver statusCode
        console.error("Error in ProcessPOSTransactionWithOfflineTokenController:", err);
        return res.status(statusCode).json({
            error: err.message || "Internal Server Error", // Mensagem padrão
      });
        }
    }
}
import { Response, Request } from "express";
import { GenerateReceiptPdfUsecase } from "./generate-receipt-pdf.usecase";
import { ITransactionOrderRepository } from "../../../repositories/transaction-order.repository";
import { ICompanyDataRepository } from "../../../../../Company/CompanyData/repositories/company-data.repository";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IAppUserInfoRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";

export class GenerateReceiptPdfController {
    constructor(
        private transactionOrderRepository: ITransactionOrderRepository,
        private businessInfoRepository: ICompanyDataRepository,
        private appUserItemRepository: IAppUserItemRepository,
        private appUserInfoRepository: IAppUserInfoRepository
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const transactionId = req.params.transactionId;
            
            const usecase = new GenerateReceiptPdfUsecase(
              this.transactionOrderRepository,
              this.businessInfoRepository,
              this.appUserItemRepository,
              this.appUserInfoRepository
            );
            
            const pdfBuffer = await usecase.execute(transactionId);

            // Define os headers da resposta para indicar um arquivo PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=comprovante-${transactionId}.pdf`);

            // Envia o buffer do PDF como resposta
            return res.send(pdfBuffer);

        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message || "An unexpected error occurred",
            });
        }
    }
}

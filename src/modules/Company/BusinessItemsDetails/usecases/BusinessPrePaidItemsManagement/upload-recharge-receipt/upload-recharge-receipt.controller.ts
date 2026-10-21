import { Request, Response } from "express";
import { UploadRechargeReceiptUseCase } from "./upload-recharge-receipt.usecase";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { IStorage } from "../../../../../../infra/providers/storage/storage";
import { ISlackProvider } from "../../../../../../infra/providers/SlackProvider";

export class UploadRechargeReceiptController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private storageProvider: IStorage,
        private slackProvider: ISlackProvider
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // @ts-ignore
            const businessInfoUuid = request.companyUser?.businessInfoUuid;
            const orderUuid = request.params.order_uuid;
            const file = request.file;

            if (!businessInfoUuid) {
                return response.status(401).json({ error: "Empresa não autenticada." });
            }

            if (!file) {
                return response.status(400).json({ error: "Nenhum arquivo enviado." });
            }

            if (!orderUuid) {
                return response.status(400).json({ error: "ID do pedido não informado." });
            }

            const useCase = new UploadRechargeReceiptUseCase(
                this.businessOrderRepository,
                this.storageProvider,
                this.slackProvider
            );

            await useCase.execute(businessInfoUuid, orderUuid, file);

            return response.status(200).json({ message: "Comprovante enviado com sucesso." });
        } catch (error: any) {
            return response.status(error.statusCode || 500).json({
                error: error.message || "Erro interno do servidor ao processar upload."
            });
        }
    }
}

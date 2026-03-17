import { Request, Response } from "express";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { ApproveRechargeOrderUsecase } from "./approve-recharge-order.usecase";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";

export class ApproveRechargeOrderController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private mailProvider: IMailProvider
    ) {}

    async handle(req: Request, res: Response) {
        try {
            // 1. Instancia o UseCase injetando o Repositório e o Provider de Email
            const usecase = new ApproveRechargeOrderUsecase(
                this.businessOrderRepository,
                this.mailProvider
            );

            const { order_uuid } = req.body;
            
            const admin_uuid = req.correctAdmin.correctAdminId

            // 2. Executa a aprovação
            const result = await usecase.execute({
                order_uuid,
                admin_uuid
            });

            // 3. Retorna sucesso
            return res.status(200).json({
                message: "Pedido aprovado com sucesso. Créditos liberados.",
                ...result
            });

        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                message: err.message || "Internal Server Error"
            });
        }
    }
}
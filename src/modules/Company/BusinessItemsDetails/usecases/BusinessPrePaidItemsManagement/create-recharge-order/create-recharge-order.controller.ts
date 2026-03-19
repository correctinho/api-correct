import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { CreateRechargeOrderUsecase } from "./create-recharge-order.usecase";

export class CreateRechargeOrderController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private appUserItemRepository: IAppUserItemRepository
    ) {}

    async handle(req: Request, res: Response) {
        try {
            // 1. Instancia o UseCase com as dependências injetadas no construtor
            const usecase = new CreateRechargeOrderUsecase(
                this.businessOrderRepository,
                this.appUserItemRepository
            );

            // 2. Extrai os dados do Frontend (Body)
            // Espera-se receber: { "item_uuid": "...", "items": [{ "user_item_uuid": "...", "amount": 500.00 }] }
            const { item_uuid, items } = req.body;

            // 3. Executa o UseCase
            const result = await usecase.execute({
                // O ID da empresa vem do Token (segurança)
                business_info_uuid: req.companyUser.businessInfoUuid,
                item_uuid: item_uuid,
                items: items
            });

            // 4. Retorna 201 (Created) com os dados do pedido e a Chave PIX
            return res.status(201).json(result);

        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                message: err.message || "Internal Server Error"
            });
        }
    }
}
import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { CreateRechargeOrderUsecase } from "./create-recharge-order.usecase";
import { ICompanyDataRepository } from "../../../../CompanyData/repositories/company-data.repository";
import { IPixProvider } from "../../../../../../infra/providers/PixProvider/IPixProvider";

export class CreateRechargeOrderController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private appUserItemRepository: IAppUserItemRepository,
        private businessInfoRepository: ICompanyDataRepository,
        private pixProvider: IPixProvider
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const usecase = new CreateRechargeOrderUsecase(
                this.businessOrderRepository,
                this.appUserItemRepository,
                this.businessInfoRepository,
                this.pixProvider
            );

            const { item_uuid, items, payment_method } = req.body;

            const result = await usecase.execute({
                // @ts-ignore
                business_info_uuid: req.companyUser.businessInfoUuid,
                item_uuid: item_uuid,
                items: items,
                payment_method: payment_method
            });

            return res.status(201).json(result);
        } catch (error: any) {
            console.error("Erro ao criar pedido de recarga:", error);
            return res.status(error.statusCode || 500).json({
                error: error.message || "Erro interno ao processar o pedido"
            });
        }
    }
}

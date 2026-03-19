import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { Request, Response } from "express";
import { PreviewRechargeOrderUsecase } from "./preview-recharge-order.usecase";

export class PreviewRechargeOrderController {
    constructor(
        private appUserItemRepository: IAppUserItemRepository
    ) {}

    async handle(req: Request, res: Response){
        try{
            const business_info_uuid = req.companyUser.businessInfoUuid
            const item_uuid = req.params.item_uuid;

            const usecase = new PreviewRechargeOrderUsecase(this.appUserItemRepository);
            const output = await usecase.execute({
                business_info_uuid,
                item_uuid
            });

            return res.status(200).json(output);
        }catch(err:any){
            return res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
        }
    }
}
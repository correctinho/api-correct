import { Request, Response } from "express";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { ListBusinessOrdersUseCase } from "./list-business-orders.usecase";

export class ListBusinessOrdersByBusinessController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const business_info_uuid = req.companyUser.businessInfoUuid;
            const item_uuid = req.params.item_uuid;
            
            const usecase = new ListBusinessOrdersUseCase(
                this.businessOrderRepository
            );

            const result = await usecase.execute(
                business_info_uuid,
                item_uuid
            );

            return res.status(200).json(result);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                message: err.message || "Internal Server Error"
            });
        }
    }
}
import { Request, Response } from "express";
import { IBusinessOrderRepository } from "../../../repositories/business-order-repository";
import { ListBusinessOrdersUseCase } from "./list-business-orders.usecase";
import { IStorage } from "../../../../../../infra/providers/storage/storage";

export class ListBusinessOrdersByCorrectAdminController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository, private storageProvider: IStorage
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const usecase = new ListBusinessOrdersUseCase(
                this.businessOrderRepository, this.storageProvider
            );

            const result = await usecase.execute(
                req.params.businessInfoUuid,
                req.params.item_uuid
            );

            return res.status(200).json(result);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                message: err.message || "Internal Server Error"
            });
        }
    }
}
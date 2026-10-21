import { Request, Response } from "express";
import { ListAllRechargeOrdersUseCase } from "./list-all-recharge-orders.usecase";
import { IBusinessOrderRepository } from '../../../repositories/business-order-repository';
import { IStorage } from "../../../../../../infra/providers/storage/storage";

export class ListAllRechargeOrdersController {
    constructor(
        private businessOrderRepository: IBusinessOrderRepository,
        private storageProvider: IStorage
    ) {}

    async handle(request: Request, response: Response) {
        try {
            const usecase = new ListAllRechargeOrdersUseCase(
                this.businessOrderRepository,
                this.storageProvider
            );

            const page = request.query.page ? parseInt(request.query.page as string) : 1;
            const limit = request.query.limit ? parseInt(request.query.limit as string) : 20;
            const status = request.query.status as string | undefined;

            const result = await usecase.execute({ page, limit, status });
            return response.status(200).json(result);
        } catch (err: any) {
            return response.status(err.statusCode || 500).json({
                message: err.message || "Internal Server Error"
            });
        }
    }
}

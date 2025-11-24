import { Request, Response } from 'express';
import { ProcessPixWebhookUsecase } from './process-pix-webhook.usecase';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';

export class ProcessPixWebhookController {
    constructor(
            private readonly transactionRepository: ITransactionOrderRepository,
        ) { }
    async handle(req: Request, res: Response) {
        try {
            const usecase = new ProcessPixWebhookUsecase(
                this.transactionRepository,
            );
            const result = await usecase.execute(req.body);

            return res.json(result);
        } catch (err: any) {
            console.log({err})
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

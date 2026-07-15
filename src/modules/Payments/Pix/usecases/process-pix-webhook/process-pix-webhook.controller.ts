import { Request, Response } from 'express';
import { ProcessPixWebhookUsecase } from './process-pix-webhook.usecase';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { ISubscriptionRepository } from '../../../SubscriptionsPlans/repositories/subscription.repository';
import { ICompanyDataRepository } from '../../../../Company/CompanyData/repositories/company-data.repository';
import { IMailProvider } from '../../../../../infra/providers/MailProvider/models/IMailProvider';

export class ProcessPixWebhookController {
    constructor(
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly businessRepository: ICompanyDataRepository,
        private readonly mailProvider: IMailProvider
    ) { }
    async handle(req: Request, res: Response) {
        try {
            const usecase = new ProcessPixWebhookUsecase(
                this.transactionRepository,
                this.subscriptionRepository,
                this.userItemRepository,
                this.businessRepository,
                this.mailProvider

            );
            const result = await usecase.execute(req.body);

            return res.json(result);
        } catch (err: any) {
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

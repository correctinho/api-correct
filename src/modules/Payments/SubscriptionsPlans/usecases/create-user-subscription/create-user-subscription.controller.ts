import { Request, Response } from 'express';
import { ISubscriptionPlanRepository } from '../../repositories/subscription-plan.repository';
import { IBenefitsRepository } from '../../../../benefits/repositories/benefit.repository';
import { CreateUserSubscriptionUsecase } from './create-user-subscription.usecase';
import { ISubscriptionRepository } from '../../repositories/subscription.repository';
import { IAppUserInfoRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import { IPixProvider } from '../../../../../infra/providers/PixProvider/IPixProvider';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { CustomError } from '../../../../../errors/custom.error';
export class CreateUserSubscriptionController {
    constructor(
        private subscriptionPlanRepository: ISubscriptionPlanRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private userInfoRepository: IAppUserInfoRepository,
        private pixProvider: IPixProvider,
        private userItemRepository: IAppUserItemRepository,
        private benefitsRepository: IBenefitsRepository,
        private transactionRepository: ITransactionOrderRepository // Injetar futuramente
    ) {}
    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const data = request.body;
            data.user_info_uuid = request.appUser.user_info_uuid;
            const usecase = new CreateUserSubscriptionUsecase(
                this.subscriptionPlanRepository,
                this.subscriptionRepository,
                this.userInfoRepository,
                this.pixProvider,
                this.userItemRepository,
                this.benefitsRepository,
                this.transactionRepository
            );

            const result = await usecase.execute(data);

            return response.status(201).json(result);
        } catch (err: any) {
            const statusCode =
                err instanceof CustomError ? err.statusCode : 500;
            return response.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

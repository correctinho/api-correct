import { Request, Response } from 'express';
import { IPixProvider } from '../../../../../infra/providers/PixProvider/IPixProvider';
import { IAppUserInfoRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { CreatePixChargeByAppUserUsecase } from './create-pix-charge-by-app-user.usecase';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';

export class CreatePixChargeController {
    constructor(
        private readonly pixProvider: IPixProvider,
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly userInfoRepository: IAppUserInfoRepository,
        private readonly userItemRepository: IAppUserItemRepository
    ) {}

    async handle(req: Request, res: Response) {
        try {
            const data = req.body;
            data.userId = req.appUser.user_info_uuid
            const usecase = new CreatePixChargeByAppUserUsecase(
                this.pixProvider,
                this.transactionRepository,
                this.userInfoRepository,
                this.userItemRepository
            )

            const result = await usecase.execute(data)

            return res.status(201).json(result)

        } catch (err: any) {
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

import { Request, Response } from 'express';
import { IPixProvider } from '../../../../../infra/providers/PixProvider/IPixProvider';
import { IAppUserInfoRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-info.repository';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { CreatePixChargeByAppUserUsecase } from './create-pix-charge-by-app-user.usecase';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { InputCreatePixChargeDTO } from './dto/create-pix-charge.dto';
import { IMailProvider } from '../../../../../infra/providers/MailProvider/models/IMailProvider';

export class CreatePixChargeController {
    constructor(
        private readonly pixProvider: IPixProvider,
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly userInfoRepository: IAppUserInfoRepository,
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly mailProvider: IMailProvider
    ) {}

    async handle(req: Request, res: Response) {
        try {
            const { amountInReais, userItemUuid } = req.body;

            const userId = req.appUser?.user_info_uuid;

            const inputDto: InputCreatePixChargeDTO = {
                userId: userId,
                amountInReais: Number(amountInReais), // Garantir que é número
                userItemUuid: userItemUuid
            };
            const usecase = new CreatePixChargeByAppUserUsecase(
                this.pixProvider,
                this.transactionRepository,
                this.userInfoRepository,
                this.userItemRepository,
                this.mailProvider
            )

            const result = await usecase.execute(inputDto)

            return res.status(201).json(result)

        } catch (err: any) {
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

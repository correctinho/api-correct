import { Request, Response } from 'express';
import { IAppUserItemRepository } from '../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { ITransactionOrderRepository } from '../../../repositories/transaction-order.repository';
import { CustomError } from '../../../../../../errors/custom.error';
import { InputTransferBetweenOwnCardsDTO } from './dto/transfer-between-own-cards.dto';
import { TransferBetweenOwnCardsUsecase } from './transfer-between-own-cards.usecase';

export class TransferBetweenOwnCardsController {
    constructor(
        private readonly userItemRepository: IAppUserItemRepository,
        private readonly transactionRepository: ITransactionOrderRepository
    ) {}

    async handle(req: Request, res: Response) {
        try {
// 1. Extrair dados do request
            // Assumindo que o middleware de auth popula req.appUser
            const userId = req.appUser?.user_info_uuid;
            const { originUserItemUuid, destinationUserItemUuid, amountInCents } = req.body;

            // 2. Validações básicas de entrada do controlador
            if (!userId) {
                 throw new CustomError("Usuário não autenticado.", 401);
            }
            // Verifica se todos os campos do corpo estão presentes
            if (!originUserItemUuid || !destinationUserItemUuid || amountInCents === undefined || amountInCents === null) {
                 throw new CustomError("Campos obrigatórios ausentes: originUserItemUuid, destinationUserItemUuid, amountInCents.", 400);
            }
            // Garante que o valor é um número
            if (typeof amountInCents !== 'number') {
                 throw new CustomError("O campo amountInCents deve ser um número.", 400);
            }

            // 3. Montar o DTO de entrada
            const inputDto: InputTransferBetweenOwnCardsDTO = {
                userId,
                originUserItemUuid,
                destinationUserItemUuid,
                amountInCents
            };

            // 4. Instanciar o UseCase com os repositórios injetados no Controller
            const usecase = new TransferBetweenOwnCardsUsecase(
                this.userItemRepository,
                this.transactionRepository
            );

            // 5. Executar a lógica de negócio
            await usecase.execute(inputDto);

            // 6. Retornar sucesso (200 OK)
            // Como não há dados de retorno específicos, um 200 vazio ou com uma mensagem simples é adequado.
            return res.status(200).send();
        } catch (err: any) {
            const statusCode = err.statusCode || 500; // Default para 500 se não houver statusCode
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error', // Mensagem padrão
            });
        }
    }
}

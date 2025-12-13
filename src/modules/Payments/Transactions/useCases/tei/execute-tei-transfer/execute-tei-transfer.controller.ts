import { Request, Response } from 'express';
import { ExecuteTeiTransferUsecase } from './execute-tei-transfer.usecase';
import { CurrencyConverter } from '../../../../../../@shared/utils/currency-converter';
import { IAppUserItemRepository } from '../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { ITransactionOrderRepository } from '../../../repositories/transaction-order.repository';
// Importe a nova classe utilitária

export class ExecuteTeiTransferController {
    constructor(
        private userItemRepository: IAppUserItemRepository,
        private transactionRepository: ITransactionOrderRepository
    ) {}
    async handle(request: Request, response: Response): Promise<Response> {
        const payerUserInfoUuid = request.appUser.user_info_uuid;

        // O 'amount' aqui virá do frontend como um número decimal (ex: 150.50)
        const { payeeUserInfoUuid, amount, description } = request.body;

        // 1. Validações de entrada
        if (!payerUserInfoUuid)
            return response.status(401).json({ error: 'Acesso negado.' });
        if (!payeeUserInfoUuid)
            return response
                .status(400)
                .json({ error: 'Destinatário obrigatório.' });

        // Valida se é um número válido e positivo
        if (
            amount === undefined ||
            amount === null ||
            typeof amount !== 'number' ||
            amount <= 0
        ) {
            return response
                .status(400)
                .json({ error: 'Valor da transferência inválido.' });
        }

        try {
            // 2. CONVERSÃO: BRL (float) -> Centavos (int)
            const amountInCents = CurrencyConverter.toCents(amount);
            
            // 3. Chamar o UseCase com o valor em centavos
            const useCase = new ExecuteTeiTransferUsecase(
                this.userItemRepository,
                this.transactionRepository
            );
            await useCase.execute({
                payerUserInfoUuid,
                payeeUserInfoUuid,
                amount: amountInCents, // Passamos o valor inteiro
                description,
            });

            return response
                .status(200)
                .json({ message: 'Transferência realizada com sucesso.' });
        } catch (error: any) {
            // ... (tratamento de erro igual ao anterior)
            const statusCode = error.statusCode || 500;
            const message =
                error.message || 'Erro ao processar a transferência.';
            if (statusCode === 500)
                console.error('[ExecuteTeiTransfer Error]', error);
            return response.status(statusCode).json({ error: message });
        }
    }
}

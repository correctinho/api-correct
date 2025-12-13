import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ITransactionOrderRepository } from "../../../repositories/transaction-order.repository";

interface RequestDTO {
    payerUserInfoUuid: string; // Quem paga (do token)
    payeeUserInfoUuid: string; // Quem recebe (do corpo da req)
    amount: number; // Valor em centavos
    description?: string;
}

export class ExecuteTeiTransferUsecase {
    constructor(
        private userItemRepository: IAppUserItemRepository,
        private transactionRepository: ITransactionOrderRepository
    ) {}

    async execute({ payerUserInfoUuid, payeeUserInfoUuid, amount, description }: RequestDTO): Promise<void> {
        // 1. Validações Básicas
        if (amount <= 0) throw new CustomError("O valor deve ser positivo.", 400);
        if (payerUserInfoUuid === payeeUserInfoUuid) throw new CustomError("Não pode transferir para si mesmo.", 400);

        // 2. Buscar as Contas Correct (UserItems)
        // Use o método que você já tem
        const payerAccount = await this.userItemRepository.findDebitUserItem(payerUserInfoUuid);
        const payeeAccount = await this.userItemRepository.findDebitUserItem(payeeUserInfoUuid);

        if (!payerAccount) throw new CustomError("Sua conta Correct não foi encontrada.", 404);
        if (!payeeAccount) throw new CustomError("A conta do destinatário não está apta a receber.", 404);


        // 4. Executar a Transferência Atômica
        try {
            await this.transactionRepository.executeTeiTransfer({
                payerUserItemUuid: payerAccount.uuid.uuid, 
                payeeUserItemUuid: payeeAccount.uuid.uuid,
                amount: amount,
                transactionData: {
                    payerUserInfoUuid: payerUserInfoUuid,
                    payeeUserInfoUuid: payeeUserInfoUuid,
                    description: description
                }
            });
        } catch (error) {
            if (error instanceof CustomError) throw error;
            console.error("[TEI Transfer Error]", error);
            throw new Error("Erro ao processar a transferência.");
        }
    }
}
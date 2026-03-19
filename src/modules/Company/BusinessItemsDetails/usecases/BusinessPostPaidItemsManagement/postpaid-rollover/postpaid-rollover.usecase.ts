import { CustomError } from "../../../../../../errors/custom.error";
import { ITransactionOrderRepository, RolloverTransactionData } from "../../../../../Payments/Transactions/repositories/transaction-order.repository";
import { InputPostpaidRolloverDTO, OutputPostpaidRolloverDTO } from "./dto/postpaid-rollover.dto";

export class PostpaidRolloverUsecase {

    constructor(private transactionOrderRepository: ITransactionOrderRepository) {}

    async execute(input: InputPostpaidRolloverDTO): Promise<OutputPostpaidRolloverDTO> {
        const { employer_item_details_uuid } = input;

        if (!employer_item_details_uuid) {
            throw new CustomError("O ID do detalhe do benefício é obrigatório.", 400);
        }

        // 1. Busca todos os grupos configurados para este benefício na empresa
        const groups = await this.transactionOrderRepository.findGroupsByEmployerItemDetails(employer_item_details_uuid);

        if (!groups || groups.length === 0) {
            throw new CustomError("Nenhum grupo de benefício encontrado para esta configuração.", 404);
        }

        const updatesToProcess: RolloverTransactionData[] = [];

        // 2. Para cada grupo, busca os colaboradores e prepara a renovação de limite
        for (const group of groups) {
            const activeUsers = await this.transactionOrderRepository.findActiveUserItemsByGroup(group.uuid);

            for (const user of activeUsers) {
                // OTIMIZAÇÃO: Só adiciona na fila de atualização quem está com o saldo diferente do limite do grupo
                if (user.balance !== group.value) {
                    updatesToProcess.push({
                        userItemUuid: user.uuid,
                        oldBalance: user.balance,
                        newBalance: group.value
                    });
                }
            }
        }

        // 3. Se ninguém gastou nada no mês, encerra com sucesso sem tocar no banco
        if (updatesToProcess.length === 0) {
            return {
                success: true,
                message: "Ciclo verificado. Nenhum colaborador precisava de renovação de limite.",
                total_users_updated: 0
            };
        }

        // 4. Envia o lote para o repositório processar em uma única transação atômica (tudo ou nada)
        const totalUpdated = await this.transactionOrderRepository.executeRolloverTransaction(updatesToProcess);

        return {
            success: true,
            message: "Limites do ciclo renovados com sucesso.",
            total_users_updated: totalUpdated
        };
    }
}

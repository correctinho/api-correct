// Em: src/modules/Payments/pix/usecases/process-pix-webhook/process-pix-webhook.usecase.ts

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../../Transactions/repositories/transaction-order.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
// import { TransactionStatus } from "../../../Transactions/enums/transaction-status.enum";

// O 'payload' pode ser tipado com mais detalhes depois, com base na documentação do Sicredi
// Exemplo (adapte conforme o payload real do Sicredi):
interface SicrediPixWebhookPayload {
    endToEndId: string; // O txid do PIX
    e2eId?: string; // Alternativa para endToEndId
    txid: string; // o seu txid que você gerou
    valor: string; // Valor da transação (em string, ex: "100.00")
    horario: string;
    pagador: {
        cpf?: string;
        cnpj?: string;
        nome: string;
    };
    // Outros campos relevantes...
}

export class ProcessPixWebhookUsecase {
    constructor(
        // private readonly transactionRepository: ITransactionOrderRepository,
        // private readonly userItemRepository: IAppUserItemRepository
    ) { }

    async execute(payload: SicrediPixWebhookPayload): Promise<void> {
        console.log("\n✅✅✅ WEBHOOK DO SICREDI RECEBIDO! ✅✅✅");
        console.log("Payload recebido:", JSON.stringify(payload, null, 2));

        // // 1. Extrair o txid do payload do Sicredi
        // // O txid que o Sicredi retorna no webhook é o mesmo 'txid' que você salvou em provider_tx_id
        // const providerTxId = payload.txid; // Ou payload.endToEndId, confirme com a docs do Sicredi
        // if (!providerTxId) {
        //     console.error("ERRO: txid não encontrado no payload do webhook.");
        //     throw new CustomError("txid não encontrado no payload do webhook.", 400);
        // }

        // // 2. Encontrar a transação no nosso banco pelo txid
        // // (Será necessário um método findByProviderTxId no seu TransactionOrderRepository)
        // const transaction = await this.transactionRepository.findByProviderTxId(providerTxId);
        // if (!transaction) {
        //     console.error(`ERRO: Transação interna não encontrada para o txid: ${providerTxId}`);
        //     // É importante não lançar um erro 500 para o webhook do provedor aqui,
        //     // senão ele pode tentar reenviar infinitamente. Apenas logar.
        //     return; // Ou lançar um erro CustomError com 200 para o provedor, mas logar o problema
        // }

        // // 3. Validações adicionais da transação interna
        // if (transaction.status === TransactionStatus.success) {
        //     console.warn(`AVISO: Transação ${transaction.uuid.uuid} já está com status 'success'. Ignorando webhook duplicado.`);
        //     return; // Já processada
        // }
        // if (transaction.status !== TransactionStatus.pending) {
        //     console.error(`ERRO: Transação ${transaction.uuid.uuid} em status inesperado para cash-in: ${transaction.status}`);
        //     return; // Status inválido para processamento de cash-in
        // }

        // // 4. Converter o valor recebido do webhook para centavos (se necessário)
        // // O payload.valor geralmente vem como string em Reais ("100.00")
        // const receivedAmountInCents = Math.round(parseFloat(payload.valor) * 100);

        // // 5. Verificar se o valor da transação corresponde ao valor esperado
        // if (transaction.net_price !== receivedAmountInCents) {
        //     console.error(`ERRO: Discrepância de valor para transação ${transaction.uuid.uuid}. Esperado ${transaction.net_price}, Recebido ${receivedAmountInCents}.`);
        //     // Pode ser um caso de fraude ou erro. Decida a ação (alertar, reverter, etc.)
        //     // Por enquanto, apenas logamos e não processamos o crédito.
        //     // Poderíamos mudar o status para 'failed' ou 'manual_review'.
        //     await transaction.failTransaction('Discrepância de valor.'); // Método a ser criado na entidade
        //     await this.transactionRepository.update(transaction);
        //     return;
        // }

        // // 6. Encontrar o AppUserItem (benefício) para creditar o saldo
        // const userItemUuid = transaction.user_item_uuid; // Obtemos do nosso registro de transação
        // if (!userItemUuid) {
        //     console.error(`ERRO: user_item_uuid não definido para a transação ${transaction.uuid.uuid}.`);
        //     await transaction.failTransaction('Item de usuário para crédito não especificado.');
        //     await this.transactionRepository.update(transaction);
        //     return;
        // }
        // const userItem = await this.userItemRepository.find(userItemUuid);
        // if (!userItem) {
        //     console.error(`ERRO: AppUserItem ${userItemUuid.uuid} não encontrado para crédito na transação ${transaction.uuid.uuid}.`);
        //     await transaction.failTransaction('Item de usuário para crédito não encontrado.');
        //     await this.transactionRepository.update(transaction);
        //     return;
        // }

        // // 7. Creditar o saldo no AppUserItem
        // console.log(`INFO: Creditando ${receivedAmountInCents} centavos no AppUserItem ${userItem.uuid.uuid} (usuário: ${userItem.user_info_uuid.uuid}).`);
        // userItem.creditBalance(receivedAmountInCents); // Método a ser criado na entidade AppUserItemEntity

        // // 8. Atualizar o AppUserItem e a Transação para "success"
        // await this.userItemRepository.update(userItem);
        // transaction.successTransaction(newDateF(new Date())); // Método a ser criado na entidade
        // await this.transactionRepository.update(transaction);

        // console.log(`✅✅✅ WEBHOOK PROCESSADO COM SUCESSO! Transação ${transaction.uuid.uuid} creditada no item ${userItem.uuid.uuid}. ✅✅✅`);
    }
}
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../../errors/custom.error';
import { ITransactionOrderRepository } from '../../../Transactions/repositories/transaction-order.repository';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { newDateF } from '../../../../../utils/date';
import { TransactionEntity } from '../../../Transactions/entities/transaction-order.entity';

// Tipagem do payload do Sicredi
export interface SicrediPix {
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    pagador?: {
        nome: string;
        cpf?: string;
        cnpj?: string;
    };
    infoPagador?: string;
}

interface SicrediPixWebhookPayload {
    pix: SicrediPix[];
}

export class ProcessPixWebhookUsecase {
    constructor(
        private readonly transactionRepository: ITransactionOrderRepository
    ) {}

    public async execute(payload: SicrediPixWebhookPayload): Promise<void> {
        console.log('\n✅✅✅ WEBHOOK DO SICREDI RECEBIDO! ✅✅✅');
        console.log('Payload recebido:', JSON.stringify(payload, null, 2));
        
        //Resposta da API
//         "pix": [
//     {
//       "endToEndId": "E03042597202511241449436k9xOoGHb",
//       "txid": "7594d8828ac9487c94e4a2d40de6856c",
//       "valor": "0.01",
//       "chave": "62960b52-9f19-4c5e-8ce3-b9528fa848c4",
//       "componentesValor": {
//         "original": {
//           "valor": "0.01"
//         }
//       },
//       "horario": "2025-11-24T14:50:03.988Z"
//     }
//   ]
        // if (!payload?.pix?.length) {
        //     console.warn(
        //         "AVISO: Webhook recebido com formato inválido ou sem a chave 'pix'."
        //     );
        //     throw new CustomError('Webhook payload inválido.', 400);
        // }
        
        // // Para lidar com múltiplos PIX no mesmo webhook (se aplicável) e reportar erros consolidados
        // // ou falhar o processamento total se qualquer item PIX tiver um erro crítico
        // const processingFailures: string[] = []; // Para coletar mensagens de erro que devem levar a um 4xx/5xx

        // for (const pixPayment of payload.pix) {
        //     const providerTxId = pixPayment.txid;
        //     if (!providerTxId) {
        //         const errorMessage = 'ERRO: Item do webhook sem txid.';
        //         console.error(errorMessage, pixPayment);
        //         processingFailures.push(`[unknown_txid] ${errorMessage}`);
        //         continue; // Passa para o próximo item do webhook, mas registra a falha
        //     }

        //     try {
        //         // Passo 1: Encontrar a transação pelo providerTxId (txid)
        //         const transaction =
        //             await this.transactionRepository.findByProviderTxId(
        //                 providerTxId
        //             );
        //         if (!transaction) {
        //             const errorMessage = `ERRO: Transação interna não encontrada para o txid: ${providerTxId}. O Sicredi pode estar enviando um PIX para uma cobrança desconhecida.`;
        //             console.error(errorMessage);
        //             processingFailures.push(
        //                 `[${providerTxId}] ${errorMessage}`
        //             );
        //             continue; // Registra a falha e passa para o próximo item
        //         }

        //         // Passo 2: Validação de idempotência (comum a todos os tipos de cash-in)
        //         if (transaction.status !== TransactionStatus.pending) {
        //             console.warn(
        //                 `AVISO: Transação ${transaction.uuid.uuid} (txid: ${providerTxId}) já processada (status: ${transaction.status}). Ignorando re-processamento.`
        //             );
        //             continue; // Esta é uma condição "já OK", não falha.
        //         }

        //         // Passo 3: Roteamento com base no tipo de transação
        //         switch (transaction.transaction_type) {
        //             case TransactionType.CASH_IN_PIX_USER:
        //                 await this.processCashInUser(transaction, pixPayment);
        //                 break;

        //             case TransactionType.CASH_IN_PIX_PARTNER:
        //                 await this.processCashInPartner(
        //                     transaction,
        //                     pixPayment
        //                 );
        //                 break;

        //             // Adicione outros tipos de CASH_IN aqui conforme forem surgindo
        //             // case TransactionType.CASH_IN_PIX_MERCHANT:
        //             //    await this.processCashInMerchant(transaction, pixPayment);
        //             //    break;

        //             default:
        //                 const errorMessage = `AVISO: Tipo de transação PIX '${transaction.transaction_type}' não suportado ou configurado para o txid ${providerTxId}.`;
        //                 console.warn(errorMessage);
        //                 processingFailures.push(
        //                     `[${providerTxId}] ${errorMessage}`
        //                 );
        //                 // Este é um caso onde o sistema não sabe como lidar, então é uma falha.
        //                 break; // Permite que o loop continue, mas o erro será lançado no final
        //         }
        //     } catch (error) {
        //         // Captura qualquer CustomError lançado pelos métodos de processamento específicos
        //         const errorMessage = `ERRO ao processar PIX para txid ${providerTxId}: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`;
        //         console.error(errorMessage, error);
        //         processingFailures.push(`[${providerTxId}] ${errorMessage}`);
        //         // Não relançamos aqui para que o loop possa continuar tentando processar outros PIX no mesmo webhook.
        //     }
        // }

        // // Passo 4: Decisão final da resposta HTTP para o Sicredi
        // if (processingFailures.length > 0) {
        //     // Se houver qualquer falha que não seja por idempotência, lançamos um CustomError.
        //     // O controlador irá capturá-lo e responder com um status HTTP de erro (4xx/5xx).
        //     const consolidatedErrorMessage = `Falhas no processamento do webhook PIX: ${processingFailures.join(' | ')}`;
        //     // Pode ser um 400 para erros de validação ou 500 para erros internos mais graves
        //     throw new CustomError(consolidatedErrorMessage, 400); // Ou 500, dependendo da sua política
        // }

        // Se chegarmos aqui, significa que todos os itens foram processados com sucesso ou já estavam em estado final.
        // O controlador responderá 200 OK.
    }

    /**
     * Processa um cash-in PIX destinado a um AppUser, creditando o saldo em seu UserItem.
     */
    private async processCashInUser(
        transaction: TransactionEntity,
        pixPayment: SicrediPix
    ): Promise<void> {
        console.log(
            `Iniciando processamento de CASH_IN_PIX_USER para a transação ${transaction.uuid.uuid}`
        );
        const EPSILON = 0.001;
        // Validação de valor
        const receivedAmountInCents = parseFloat(pixPayment.valor) * 100;
        // if (Math.abs(transaction.net_price - receivedAmountInCents) > EPSILON) {
        //     console.log("CAIU AQUI *********")
        //     const errorMessage = `ERRO DE VALOR para CASH_IN_PIX_USER (tx: ${transaction.uuid.uuid}). Esperado: ${transaction.net_price} (reais), Recebido: ${receivedAmountInCents} (reais). Diferença maior que ${EPSILON}.`;
        //     console.error(errorMessage);
        //     throw new CustomError(errorMessage, 400);
        // }
        // Atualiza a entidade de domínio com os detalhes do pagamento
        const paidAtString = newDateF(new Date(pixPayment.horario));
        transaction.setPixPaymentDetails(pixPayment.endToEndId, paidAtString);

        // Delega para o repositório a lógica transacional de crédito e persistência
        const result =
            await this.transactionRepository.processAppUserPixCreditPayment(
                transaction,
                receivedAmountInCents
            );

        if (result.success) {
            console.log(
                `✅ SUCESSO: Crédito PIX para AppUser processado para a transação ${transaction.uuid.uuid}.`
            );
        } else {
            console.log("Deu erro aqui 1")
            // Se o repositório retornar 'success: false' sem lançar um erro
            const errorMessage = `❌ FALHA: Repositório falhou ao processar crédito PIX para AppUser (tx: ${transaction.uuid.uuid}).`;
            console.error(errorMessage);
            throw new CustomError(errorMessage, 500); // Indicar um erro interno
        }
    }

    /**
     * Processa um cash-in PIX destinado a um Partner, creditando o saldo em sua BusinessAccount.
     * (Placeholder para implementação futura)
     */
    private async processCashInPartner(
        transaction: TransactionEntity,
        pixPayment: SicrediPix
    ): Promise<void> {
        console.log(
            `AVISO: Processamento para CASH_IN_PIX_PARTNER (transação ${transaction.uuid.uuid}) ainda não implementado. Ignorando.`
        );
        // Aqui entraria a lógica futura:
        // 1. Validar valor (similar ao processCashInUser)
        // 2. Chamar um novo método no repositório: `this.transactionRepository.processPartnerPixCreditPayment(...)`.
        // 3. Este novo método faria o crédito na `BusinessAccount` ou similar do parceiro
        //    e registraria o histórico correspondente.

        // POR ENQUANTO, como é um placeholder, se ele for chamado, indica um problema.
        // Podemos tratar isso como uma falha para que o Sicredi reenvie e tenhamos chance de implementar.
        const errorMessage = `ERRO: Processamento para CASH_IN_PIX_PARTNER (tx: ${transaction.uuid.uuid}) não implementado.`;
        console.error(errorMessage);
        throw new CustomError(errorMessage, 501); // 501 Not Implemented
    }

    // Futuramente, você pode adicionar mais métodos como:
    // private async processCashInMerchant(transaction: TransactionEntity, pixPayment: SicrediPix): Promise<void> { ... }
}

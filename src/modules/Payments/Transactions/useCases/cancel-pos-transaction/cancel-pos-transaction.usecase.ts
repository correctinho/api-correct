import { TransactionStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputCancelPOSTransactionDTO, OutputCancelPOSTransactionDTO } from "./dto/cancel-pos-transaction.dto";
import { sseDisconnect, sseSendEvent } from "../../../../../infra/sse/sse.config";

export class CancelPOSTransactionUsecase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository
  ) {}

  async execute(input: InputCancelPOSTransactionDTO): Promise<OutputCancelPOSTransactionDTO> {
    const transactionUuid = new Uuid(input.transaction_uuid);
    const partnerUserUuid = new Uuid(input.partner_user_uuid);

    // 1. Buscar a transação
    const transaction = await this.transactionOrderRepository.find(transactionUuid);

    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    // 2. Validações de Negócio
    // Verifica se é uma transação de POS. Não queremos cancelar pagamentos de assinatura por aqui, por exemplo.
    if (transaction.transaction_type !== 'POS_PAYMENT') {
        throw new CustomError("Only POS transactions can be cancelled via this method.", 400);
    }

    if (transaction.status !== TransactionStatus.pending) {
      throw new CustomError(`Cannot cancel transaction with status '${transaction.status}'. Only 'PENDING' transactions can be cancelled.`, 400);
    }
   
    transaction.changeStatus(TransactionStatus.cancelled);

    // 4. Salvar a transação atualizada
    await this.transactionOrderRepository.cancelTransaction(transaction.uuid);

    console.log(`[Cancelamento] Transação ${input.transaction_uuid} cancelada no banco.`);

    // --- LÓGICA DE NOTIFICAÇÃO E FECHAMENTO SSE ---

    // 2. (Opcional) Avisa via SSE que foi cancelado.
    // Isso garante que o frontend receba a notificação mesmo que o request HTTP do botão "Cancelar" falhe no retorno.
    sseSendEvent(input.transaction_uuid, 'transactionCancelled', {
        status: 'CANCELLED',
        message: 'A transação foi cancelada pelo operador.'
    });

    // 3. IMPORTANTE: Fecha a conexão SSE proativamente.
    // Não precisamos mais manter esse canal aberto, pois a transação morreu.
    sseDisconnect(input.transaction_uuid);

    // 5. Retornar DTO de saída
    return {
      transaction_uuid: transaction.uuid.uuid,
      status: transaction.status,
      updated_at: transaction.updated_at
    };
  }
}
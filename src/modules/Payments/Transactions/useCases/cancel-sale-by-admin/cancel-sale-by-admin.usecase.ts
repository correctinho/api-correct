import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputCancelSaleByAdminDTO, OutputCancelSaleByAdminDTO } from "./dto/cancel-sale-by-admin.dto";
import { TransactionStatus } from "@prisma/client";

export class CancelSaleByAdminUseCase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository
  ) {}

  async execute(input: InputCancelSaleByAdminDTO): Promise<OutputCancelSaleByAdminDTO> {
    const transactionUuid = new Uuid(input.transaction_uuid);

    // 1. Buscar a transação
    const transaction = await this.transactionOrderRepository.find(transactionUuid);
    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }

    // 2. O Admin pode cancelar qualquer transação com status success, independente do prazo
    if (transaction.status !== TransactionStatus.success) {
      throw new CustomError("Apenas transações com status 'success' podem ser estornadas.", 400);
    }

    // 3. Executar o estorno nos livros contábeis via repositório
    try {
      const result = await this.transactionOrderRepository.refundPartnerSale(transaction, input.reason);
      
      // Atualiza a entidade localmente para manter coerência
      if (result.success) {
        transaction.refundTransaction();
      }

    } catch (error: any) {
      throw new CustomError(error.message || "Erro ao tentar realizar o estorno.", error.statusCode || 500);
    }

    // 4. Retornar
    return {
      transaction_uuid: transaction.uuid.uuid,
      status: transaction.status,
      updated_at: transaction.updated_at
    };
  }
}

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";
import { InputCancelPartnerSaleDTO, OutputCancelPartnerSaleDTO } from "./dto/cancel-partner-sale.dto";

export class CancelPartnerSaleUseCase {
  constructor(
    private transactionOrderRepository: ITransactionOrderRepository
  ) { }

  async execute(input: InputCancelPartnerSaleDTO): Promise<OutputCancelPartnerSaleDTO> {
    const transactionUuid = new Uuid(input.transaction_uuid);

    const transaction = await this.transactionOrderRepository.find(transactionUuid);
    if (!transaction) {
      throw new CustomError("Transaction not found.", 404);
    }
    // 2. Validar o pertencimento ao parceiro
    if (!transaction.favored_business_info_uuid || transaction.favored_business_info_uuid.uuid !== input.business_info_uuid) {
      throw new CustomError("This transaction does not belong to your business.", 403);
    }

    // 3. Validar se a transação pode ser estornada (prazo 7 dias e status success)
    if (!transaction.canBeRefunded(7)) {
      throw new CustomError("Esta transação não pode mais ser estornada (prazo de 7 dias expirado ou status inválido).", 400);
    }
    // 4. Executar o estorno nos livros contábeis via repositório
    try {
      const result = await this.transactionOrderRepository.refundPartnerSale(transaction, input.reason);
      // Atualiza a entidade localmente para manter coerência (embora o repositório já tenha atualizado no BD)
      if (result.success) {
        transaction.refundTransaction();
      }

    } catch (error: any) {
      throw new CustomError(error.message || "Erro ao tentar realizar o estorno.", error.statusCode || 500);
    }

    // 5. Retornar
    return {
      transaction_uuid: transaction.uuid.uuid,
      status: transaction.status,
      updated_at: transaction.updated_at
    };
  }
}

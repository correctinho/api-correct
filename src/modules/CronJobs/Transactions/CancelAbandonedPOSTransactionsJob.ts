import { ICronJob } from "../../../infra/cron/ICronJob";
import { newDateF } from "../../../utils/date";
import { ITransactionOrderRepository } from "../../Payments/Transactions/repositories/transaction-order.repository";

export interface CancelAbandonedPOSTransactionsResult {
  cancelledCount: number;
  cutoffDate: string;
}

export class CancelAbandonedPOSTransactionsJob implements ICronJob {
  name = 'CancelAbandonedPOSTransactionsJob';
  // Sugestão de agendamento: a cada 30 minutos
  schedule = '*/30 * * * *';

  constructor(
    private readonly transactionRepository: ITransactionOrderRepository
  ) {}

  async execute(minutesThreshold = 30): Promise<CancelAbandonedPOSTransactionsResult> {
    console.log(`[${this.name}] ⏰ Iniciando cancelamento de transações POS abandonadas (limite: ${minutesThreshold} min)...`);

    const cutoffTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
    const cutoffDate = newDateF(cutoffTime);

    const cancelledCount = await this.transactionRepository.cancelAbandonedPOSTransactions(cutoffDate);

    console.log(`[${this.name}] ✅ ${cancelledCount} transações POS abandonadas (anteriores a ${cutoffDate}) foram canceladas.`);

    return {
      cancelledCount,
      cutoffDate,
    };
  }
}

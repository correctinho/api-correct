import { InputListTransactionsDto } from "../../application/usecases/dto/list-transactions.dto";

// Interface auxiliar para manter o contrato limpo e tipado
export interface AggregatedFinancials {
  total_original_price_cents: number;
  total_net_price_cents: number;
  total_platform_fee_cents: number;
  total_cashback_cents: number;
}

export interface IListTransactionsRepository {
  /**
   * Retorna a lista de transações paginada, o total de registros
   * e as agregações financeiras completas baseadas nos filtros.
   */
  findAllPaginated(
    filters: InputListTransactionsDto
  ): Promise<{
    transactions: any[],
    total: number,
    aggregates: AggregatedFinancials
  }>;
}
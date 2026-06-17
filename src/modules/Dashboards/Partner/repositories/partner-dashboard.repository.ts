import { TransactionEntity } from "../../../Payments/Transactions/entities/transaction-order.entity";

// DTOs auxiliares para retorno das métricas agregadas
export interface DashboardAggregateResult {
  totalRevenue: number;
  transactionCount: number;
}

export interface DailyMetricResult {
  date: string; // Formato YYYY-MM-DD
  amount: number;
}

export interface OperatorRankingResult {
  name: string;
  amount: number;
  count: number;
}

export interface RecentTransactionResult {
  entity: TransactionEntity;
  payerName: string;
  operatorName: string;
}

export interface IPartnerDashboardRepository {
  /**
   * Retorna o total faturado e a quantidade de vendas em um intervalo de tempo.
   */
  getAggregateMetrics(
    businessInfoUuid: string,
    startDate: Date,
    endDate: Date
  ): Promise<DashboardAggregateResult>;

  /**
   * Retorna os dados agrupados por dia para o gráfico.
   */
  getDailyRevenue(
    businessInfoUuid: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyMetricResult[]>;

  /**
   * Retorna o Top 5 Operadores/Vendedores por volume de vendas.
   */
  getOperatorRanking(
    businessInfoUuid: string,
    startDate: Date,
    endDate: Date
  ): Promise<OperatorRankingResult[]>;

  /**
   * Busca as últimas transações aprovadas para exibição rápida,
   * incluindo os nomes do pagador e do vendedor (operador).
   */
  findRecentTransactions(
    businessInfoUuid: string,
    limit: number
  ): Promise<RecentTransactionResult[]>;
}
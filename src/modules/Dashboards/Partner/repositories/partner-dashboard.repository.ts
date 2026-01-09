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
   * Busca as últimas transações aprovadas para exibição rápida.
   */
  findRecentTransactions(
    businessInfoUuid: string,
    limit: number
  ): Promise<TransactionEntity[]>;
}
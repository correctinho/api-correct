export interface DashboardKPIs {
  currentMonth: {
    totalRevenue: number;
    transactionCount: number;
    averageTicket: number;
  };
  growth: {
    revenuePercentage: number; // Ex: 15.5 (cresceu) ou -5.0 (caiu)
    transactionsPercentage: number;
  };
  today: {
    totalRevenue: number;
    transactionCount: number;
  };
}

export interface DailyChartData {
  date: string;
  amount: number;
}

// NOVO: Interface para o Ranking de Operadores
export interface OperatorRankingData {
  name: string;
  amount: number;
  count: number;
}

export interface OutputGetPartnerDashboardDTO {
  kpis: DashboardKPIs;
  salesChart: DailyChartData[];
  operatorRanking: OperatorRankingData[]; // NOVO
  recentTransactions: {
    uuid: string;
    amount: number;
    status: string;
    created_at: string;
    payerName: string;
    operatorName: string; // NOVO: Nome de quem fez a venda
  }[];
}
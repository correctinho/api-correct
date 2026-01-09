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

export interface OutputGetPartnerDashboardDTO {
  kpis: DashboardKPIs;
  salesChart: DailyChartData[];
  recentTransactions: {
    uuid: string;
    amount: number;
    status: string;
    created_at: string;
    payerName: string; // Nome do funcionário que comprou
  }[];
}
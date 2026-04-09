export interface IDashboardRepository {
  getRevenueByReferenceMonth(referenceMonth: string): Promise<number>;
  getOverdueAmount(currentDate: Date): Promise<number>;
  getActiveBusinessCount(businessType: "comercio" | "empregador"): Promise<number>;
  getTopBranchesByTransactions(startDate: string, endDate: string, limit: number): Promise<any[]>;
}

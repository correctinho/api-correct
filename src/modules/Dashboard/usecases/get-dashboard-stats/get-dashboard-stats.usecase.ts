import { IDashboardRepository } from "../../repositories/dashboard.repository";
import { newDateF } from "../../../../utils/date";

export class GetDashboardStatsUsecase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute() {
    const now = new Date();

    // 1. Reference months calculation
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();
    const currentReferenceMonth = `${currentMonth}/${currentYear}`;

    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    const prevYear = prevDate.getFullYear();
    const prevReferenceMonth = `${prevMonth}/${prevYear}`;

    // 2. Fetch revenues
    const currentRevenue = await this.dashboardRepository.getRevenueByReferenceMonth(currentReferenceMonth);
    const prevRevenue = await this.dashboardRepository.getRevenueByReferenceMonth(prevReferenceMonth);

    // 3. Calculate comparison percentage
    let revenueComparison = 0;
    if (prevRevenue > 0) {
      revenueComparison = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueComparison = 100;
    }

    // 4. Overdue Amount
    const overdueAmount = await this.dashboardRepository.getOverdueAmount(now);

    // 5. Active Partners & Employers
    const totalActivePartners = await this.dashboardRepository.getActiveBusinessCount("comercio");
    const totalActiveEmployers = await this.dashboardRepository.getActiveBusinessCount("empregador");

    // 6. Top branches in last month
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const startDateStr = newDateF(startDate);
    const endDateStr = newDateF(now);

    const topBranches = await this.dashboardRepository.getTopBranchesByTransactions(startDateStr, endDateStr, 5);

    return {
      monthly_revenue: currentRevenue,
      revenue_comparison: Number(revenueComparison.toFixed(2)),
      overdue_amount: overdueAmount,
      total_active_partners: totalActivePartners,
      total_active_employers: totalActiveEmployers,
      top_branches: topBranches
    };
  }
}

import { IBusinessItemDetailsRepository } from "../../../Company/BusinessItemsDetails/repositories/business-item-details.repository";
import { IEmployerDashboardRepository } from "../repositories/employer-dashboard.repository";
import { OutputEmployerDashboardMetricsDTO } from "./dto/get-employer-dashboard-metrics.dto";

export class GetEmployerDashboardMetricsUsecase {
    constructor(
        private employerDashboardRepository: IEmployerDashboardRepository
    ) { }

    async execute(businessInfoUuid: string): Promise<OutputEmployerDashboardMetricsDTO> {
        const metrics = await this.employerDashboardRepository.getDashboardMetrics(businessInfoUuid);

        return {
            overview: {
                total_benefits: metrics.overview.total_benefits,
                custom_benefits: metrics.overview.custom_benefits,
                total_lives: metrics.overview.total_lives,
                estimated_monthly_cost: metrics.overview.estimated_monthly_cost / 100,
            },
            distribution: metrics.distribution.map(item => ({
                category: item.category,
                amount: item.amount / 100 
            }))
        }
    }
}
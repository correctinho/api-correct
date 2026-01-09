import { Request, Response } from "express";
import { IEmployerDashboardRepository } from "../repositories/employer-dashboard.repository";
import { GetEmployerDashboardMetricsUsecase } from "./get-employer-dashboard-metrics.usecase";

export class GetEmployerDashboardMetricsController {
    constructor(
        private employerDashboardRepository: IEmployerDashboardRepository
    ) {}

    async handle(req: Request, res: Response) {
        try {
            const usecase = new GetEmployerDashboardMetricsUsecase(this.employerDashboardRepository);

            const businessInfoUuid = req.companyUser.businessInfoUuid;

            const result = await usecase.execute(businessInfoUuid);

            return res.status(200).json(result);

        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                message: err.message || "Erro inesperado ao buscar métricas do dashboard."
            });
        }
    }
}
import { EmployerDashboardPrismaRepository } from "../repositories/implementations/employer-dashboard.prisma.repository";
import { GetEmployerDashboardMetricsController } from "./get-employer-dashboard-metrics.controller";

const employerDashboardRepository = new EmployerDashboardPrismaRepository()

const getEmployerDashbardoMetricsController = new GetEmployerDashboardMetricsController(
    employerDashboardRepository
);

export { getEmployerDashbardoMetricsController };
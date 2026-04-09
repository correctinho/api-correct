import { DashboardPrismaRepository } from "../../repositories/implementations/dashboard.prisma.repository";
import { GetDashboardStatsController } from "./get-dashboard-stats.controller";
import { GetDashboardStatsUsecase } from "./get-dashboard-stats.usecase";

const dashboardRepository = new DashboardPrismaRepository();
const getDashboardStatsUsecase = new GetDashboardStatsUsecase(dashboardRepository);
const getDashboardStatsController = new GetDashboardStatsController(getDashboardStatsUsecase);

export { getDashboardStatsController };

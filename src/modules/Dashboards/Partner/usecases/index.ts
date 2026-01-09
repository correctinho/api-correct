import { PartnerDashboardPrismaRepository } from "../repositories/implementations/partner-dashboard-prisma.repository";
import { GetPartnerDashboardController } from "./get-partner-dashboard-metrics.controller";

const partnerDashboardRepository = new PartnerDashboardPrismaRepository()

const getPartnerDashboardController = new GetPartnerDashboardController(
    partnerDashboardRepository
);

export { getPartnerDashboardController };
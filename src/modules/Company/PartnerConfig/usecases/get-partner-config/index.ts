import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { GetPartnerConfigByBusinessAdminController } from "./get-partner-config.controller";

const partnerConfigRepository = new PartnerConfigPrismaRepository()
const getPartnerConfigByBusinessAdminController = new GetPartnerConfigByBusinessAdminController(partnerConfigRepository);
export { getPartnerConfigByBusinessAdminController };

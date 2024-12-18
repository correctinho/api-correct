import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { GetPartnersByCategoryController } from "./get-partners-by-category.controller";

const partnerConfigRepository = new PartnerConfigPrismaRepository()
const getPartnersByCategory = new GetPartnersByCategoryController(partnerConfigRepository)

export { getPartnersByCategory }

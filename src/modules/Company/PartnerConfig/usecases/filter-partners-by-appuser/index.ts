import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { FilterPartnersByAppUserController } from "./filter-partners-by-appuser.controller";

const partnerConfigRepository = new PartnerConfigPrismaRepository()
const filterPartnersByAppUser = new FilterPartnersByAppUserController(partnerConfigRepository)

export { filterPartnersByAppUser }

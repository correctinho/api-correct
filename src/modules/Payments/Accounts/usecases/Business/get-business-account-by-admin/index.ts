import { BusinessAccountPrismaRepository } from "../../repositories/implementations/business-account-prisma.repository";
import { GetBusinessAccountByAdminController } from "./get-business-account-by-admin.controller";

const businessAccountRepository = new BusinessAccountPrismaRepository()
const getBusinessAccountController = new GetBusinessAccountByAdminController(businessAccountRepository)

export { getBusinessAccountController }

import { CorrectAdminPrismaRepository } from "../../repositories/implementations/correct-admin.prisma.repository";
import { CreateCorrectSellerByAdminController } from "./create-correct-seller.controller";

const correctAdminRepository = new CorrectAdminPrismaRepository()
const createCorrectSellerController = new CreateCorrectSellerByAdminController(correctAdminRepository)

export { createCorrectSellerController }

import { CorrectAdminAccountPrismaRepository } from "../../repositories/implementations/correct-admin-prisma.repository";
import { GetCorrectAdminAccountController } from "./get-correct-admin-account.controller";

const correctAdminAccount = new CorrectAdminAccountPrismaRepository()
const getCorrectAdminAccount = new GetCorrectAdminAccountController(correctAdminAccount)

export {getCorrectAdminAccount}

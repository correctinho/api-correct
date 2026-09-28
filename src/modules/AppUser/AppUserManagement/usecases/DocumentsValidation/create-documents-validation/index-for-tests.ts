import { FakeStorage } from "../../../../../../infra/providers/storage/implementations/fake/fake.storage";
import { CloudflareR2Storage } from "../../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";
import { DocumentValidationPrismaRepository } from "../../../repositories/implementations-document-validation/app-user-document-validation-prisma.repository";
import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { CreateDocumentsValidationController } from "./create-documents-validation.controller";

const userAuthRepository = new AppUserAuthPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const documentsValidationRepository = new DocumentValidationPrismaRepository()
const fakeStorage = new FakeStorage()
const createDocumentsE2ETestsController = new CreateDocumentsValidationController(
    userAuthRepository,
    userInfoRepository,
    documentsValidationRepository,
    fakeStorage
)

export { createDocumentsE2ETestsController }
import { CloudflareR2Storage } from "../../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";
import { AwsDocumentValidatorProvider } from "../../../../../../infra/providers/document-validator/implementations/aws/aws-document-validator.provider";
import { DocumentValidationPrismaRepository } from "../../../repositories/implementations-document-validation/app-user-document-validation-prisma.repository";
import { AppUserAuthPrismaRepository } from "../../../repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { CreateDocumentsValidationController } from "./create-documents-validation.controller";

const userAuthRepository = new AppUserAuthPrismaRepository();
const userInfoRepository = new AppUserInfoPrismaRepository();
const documentsValidationRepository = new DocumentValidationPrismaRepository();
const supabaseRepository = new CloudflareR2Storage();
const documentValidatorProvider = new AwsDocumentValidatorProvider();
const createDocumentsController = new CreateDocumentsValidationController(
    userAuthRepository,
    userInfoRepository,
    documentsValidationRepository,
    supabaseRepository,
    documentValidatorProvider,
);

export { createDocumentsController };

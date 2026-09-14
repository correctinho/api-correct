import { DocumentValidationPrismaRepository } from "../../../repositories/implementations-document-validation/app-user-document-validation-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { UpdateDocumentValidationStatusByAdminController } from "./update-document-validation-status-by-admin.controller";
import { UpdateDocumentValidationStatusByAdminUsecase } from "./update-document-validation-status-by-admin.usecase";

const validationRepository = new DocumentValidationPrismaRepository();
const userInfoRepository = new AppUserInfoPrismaRepository();

const updateDocumentValidationStatusByAdminUsecase = new UpdateDocumentValidationStatusByAdminUsecase(validationRepository, userInfoRepository);
const updateDocumentValidationStatusByAdminController = new UpdateDocumentValidationStatusByAdminController(updateDocumentValidationStatusByAdminUsecase);

export { updateDocumentValidationStatusByAdminController };

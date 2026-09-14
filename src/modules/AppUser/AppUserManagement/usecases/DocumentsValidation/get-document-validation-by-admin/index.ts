import { DocumentValidationPrismaRepository } from "../../../repositories/implementations-document-validation/app-user-document-validation-prisma.repository";
import { AppUserInfoPrismaRepository } from "../../../repositories/implementations-user-info/app-user-info-prisma.repository";
import { GetDocumentValidationByAdminController } from "./get-document-validation-by-admin.controller";
import { GetDocumentValidationByAdminUsecase } from "./get-document-validation-by-admin.usecase";

const validationRepository = new DocumentValidationPrismaRepository();
const userInfoRepository = new AppUserInfoPrismaRepository();

const getDocumentValidationByAdminUsecase = new GetDocumentValidationByAdminUsecase(validationRepository, userInfoRepository);
const getDocumentValidationByAdminController = new GetDocumentValidationByAdminController(getDocumentValidationByAdminUsecase);

export { getDocumentValidationByAdminController };

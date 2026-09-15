import { CustomError } from "../../../../../../errors/custom.error";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserDocumentValidationRepository } from "../../../repositories/app-user-document-validation.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";

export class GetDocumentValidationByAdminUsecase {
    constructor(
        private readonly validationRepository: IAppUserDocumentValidationRepository,
        private readonly userInfoRepository: IAppUserInfoRepository
    ) { }

    async execute(userInfoUuid: string): Promise<any> {
        // 1. Busca o UserInfo para pegar o user_document_validation_uuid
        const userInfoId = new Uuid(userInfoUuid);
        const userInfo = await this.userInfoRepository.find(userInfoId);

        if (!userInfo) {
            throw new CustomError("Usuário não encontrado.", 404);
        }

        if (!userInfo.user_document_validation_uuid) {
            return null; // O usuário ainda não enviou documentos
        }

        const validationId = userInfo.user_document_validation_uuid;

        // 2. Busca os documentos (com URLs e Statuses)
        const documents = await this.validationRepository.find(validationId);

        if (!documents) {
            return null;
        }

        return documents.toJSON();
    }
}

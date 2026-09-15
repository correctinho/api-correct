import { UserDocumentValidationStatus } from "@prisma/client";
import { CustomError } from "../../../../../../errors/custom.error";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserDocumentValidationRepository } from "../../../repositories/app-user-document-validation.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";

export type UpdateDocumentValidationStatusInput = {
    user_info_uuid: string;
    document_front_status?: UserDocumentValidationStatus;
    document_back_status?: UserDocumentValidationStatus;
    selfie_status?: UserDocumentValidationStatus;
    document_selfie_status?: UserDocumentValidationStatus;
};

export class UpdateDocumentValidationStatusByAdminUsecase {
    constructor(
        private readonly validationRepository: IAppUserDocumentValidationRepository,
        private readonly userInfoRepository: IAppUserInfoRepository
    ) { }

    async execute(input: UpdateDocumentValidationStatusInput): Promise<void> {
        const userInfoId = new Uuid(input.user_info_uuid);
        const userInfo = await this.userInfoRepository.find(userInfoId);

        if (!userInfo) {
            throw new CustomError("Usuário não encontrado.", 404);
        }

        if (!userInfo.user_document_validation_uuid) {
            throw new CustomError("Nenhum documento enviado por este usuário ainda.", 400);
        }

        const validationId = userInfo.user_document_validation_uuid;
        const documents = await this.validationRepository.find(validationId);

        if (!documents) {
            throw new CustomError("Validação de documentos não encontrada.", 404);
        }

        // Atualiza os status enviados
        if (input.document_front_status) documents.changeDocumentFrontStatus(input.document_front_status);
        if (input.document_back_status) documents.changeDocumentBackStatus(input.document_back_status);
        if (input.selfie_status) documents.changeSelfieStatus(input.selfie_status);
        if (input.document_selfie_status) documents.changeDocumentSelfieStatus(input.document_selfie_status);

        // Salva as alterações (o repositório automaticamente recalcula o status geral do UserInfo)
        await this.validationRepository.saveOrUpdate(documents, userInfoId);
    }
}

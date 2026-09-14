import { Request, Response } from "express";
import { UpdateDocumentValidationStatusByAdminUsecase } from "./update-document-validation-status-by-admin.usecase";

export class UpdateDocumentValidationStatusByAdminController {
    constructor(private readonly usecase: UpdateDocumentValidationStatusByAdminUsecase) {}

    async handle(request: Request, response: Response): Promise<Response> {
        const { user_info_uuid } = request.params;
        const { document_front_status, document_back_status, selfie_status, document_selfie_status } = request.body;

        if (!user_info_uuid) {
            return response.status(400).json({ message: "O parâmetro user_info_uuid é obrigatório." });
        }

        await this.usecase.execute({
            user_info_uuid,
            document_front_status,
            document_back_status,
            selfie_status,
            document_selfie_status
        });

        return response.status(200).json({ message: "Status de validação atualizado com sucesso." });
    }
}

import { Request, Response } from "express";
import { GetDocumentValidationByAdminUsecase } from "./get-document-validation-by-admin.usecase";

export class GetDocumentValidationByAdminController {
    constructor(private readonly usecase: GetDocumentValidationByAdminUsecase) {}

    async handle(request: Request, response: Response): Promise<Response> {
        const { user_info_uuid } = request.params;

        if (!user_info_uuid) {
            return response.status(400).json({ message: "O parâmetro user_info_uuid é obrigatório." });
        }

        const documents = await this.usecase.execute(user_info_uuid);

        return response.status(200).json(documents);
    }
}

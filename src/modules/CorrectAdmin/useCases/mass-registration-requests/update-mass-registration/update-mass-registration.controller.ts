import { Request, Response } from "express";
import { UpdateMassRegistrationUseCase } from "./update-mass-registration.usecase";

export class UpdateMassRegistrationController {
    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const { uuid } = request.params;
            const file = request.file;

            if (!file) {
                return response.status(400).json({ error: "Nenhum arquivo enviado" });
            }

            const useCase = new UpdateMassRegistrationUseCase();
            const result = await useCase.execute({
                uuid,
                file_content: file.buffer.toString('utf-8')
            });

            return response.status(200).json(result);
        } catch (err: any) {
            return response.status(err.statusCode || 500).json({
                message: err.message || "Erro inesperado ao atualizar planilha"
            });
        }
    }
}

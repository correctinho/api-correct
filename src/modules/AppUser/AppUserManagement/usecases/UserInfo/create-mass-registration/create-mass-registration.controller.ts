import { Request, Response } from "express";
import { CreateMassRegistrationUseCase } from "./create-mass-registration.usecase";
import { ISlackProvider } from "../../../../../../infra/providers/SlackProvider";

export class CreateMassRegistrationController {
    constructor(
        private slackProvider: ISlackProvider
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // @ts-ignore
            const businessInfoUuid = request.companyUser?.businessInfoUuid;
            
            const file = request.file;

            if (!file) {
                return response.status(400).json({ error: "Arquivo CSV não enviado" });
            }

            if (!businessInfoUuid) {
                return response.status(401).json({ error: "Usuário não autenticado corretamente na empresa" });
            }

            const file_content = file.buffer.toString("utf8");

            const useCase = new CreateMassRegistrationUseCase(this.slackProvider);
            const result = await useCase.execute(businessInfoUuid, file_content);

            return response.status(201).json(result);
        } catch (err: any) {
            return response.status(err.statusCode || 500).json({
                message: err.message || "Erro inesperado ao salvar planilha"
            });
        }
    }
}

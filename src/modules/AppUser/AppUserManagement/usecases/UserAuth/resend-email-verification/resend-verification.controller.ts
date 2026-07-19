import { Request, Response } from 'express';
import { z } from 'zod'; // Usando zod para validar a entrada
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";
import { ResendVerificationEmailUsecase } from './ResendVerificationEmailUsecase';
import { CustomError } from '../../../../../../errors/custom.error';

export class ResendVerificationController {
    constructor(
        private appUserAuthRepository: IAppUserAuthRepository,
        private mailProvider: IMailProvider
    ) { }
    async handle(request: Request, response: Response): Promise<Response> {

        try {
            const document = request.body.document;
            const usecase = new ResendVerificationEmailUsecase(this.appUserAuthRepository, this.mailProvider);
            const result = await usecase.execute(document);

            // Sempre retornamos 200 OK com a mesma mensagem por segurança (User Enumeration)
            return response.status(200).json(result);

        } catch (err: any) {
            if (err instanceof CustomError) {
                return response.status(err.statusCode).json({
                    error: err.message
                });
            }
            return response.status(500).json({
                error: "Ocorreu um erro interno no servidor. Tente novamente mais tarde."
            });
        }

    }
}
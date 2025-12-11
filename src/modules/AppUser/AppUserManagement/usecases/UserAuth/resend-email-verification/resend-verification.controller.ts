import { Request, Response } from 'express';
import { z } from 'zod'; // Usando zod para validar a entrada
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";
import { ResendVerificationEmailUsecase } from './ResendVerificationEmailUsecase';

export class ResendVerificationController {
    constructor(
        private appUserAuthRepository: IAppUserAuthRepository,
        private mailProvider: IMailProvider
    ) {}
    async handle(request: Request, response: Response): Promise<Response> {
       
        const document = request.body.document;
        const usecase = new ResendVerificationEmailUsecase(this.appUserAuthRepository, this.mailProvider);
        const result = await usecase.execute(document);

        // Sempre retornamos 200 OK com a mesma mensagem por segurança (User Enumeration)
        return response.status(200).json(result);
    }
}
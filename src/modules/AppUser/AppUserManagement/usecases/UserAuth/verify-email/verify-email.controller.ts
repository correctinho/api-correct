import { Request, Response } from 'express';
import { VerifyEmailUsecase } from './verify-email.usecase';
import { IAppUserAuthRepository } from '../../../repositories/app-use-auth-repository';
import { CustomError } from '../../../../../../errors/custom.error';

export class VerifyEmailController {
     constructor(
            private appUserAuthRepository: IAppUserAuthRepository
        ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // 1. Extrair o token do corpo da requisição
            const { token } = request.body;

            // Validação básica de entrada HTTP
            if (!token || typeof token !== 'string') {
                throw new CustomError('Validation token is required in the request body.', 400);
            }

            const usecase = new VerifyEmailUsecase(this.appUserAuthRepository)
            // 2. Executar a regra de negócio
            await usecase.execute({ token });

            // 3. Retornar sucesso
            return response.status(200).send();

        } catch (error: any) {
            // Tratamento de Erros
            if (error instanceof CustomError) {
                // Erros de domínio conhecidos (token expirado, usuário não encontrado, etc.)
                return response.status(error.statusCode).json({
                    error: error.message
                });
            }

            // Erros inesperados de servidor
            console.error('[VerifyEmailController] Unexpected error:', error);
            return response.status(500).json({
                error: 'Internal server error during email verification.'
            });
        }
    }
}
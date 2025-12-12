import { Request, Response } from 'express';
import { z } from 'zod';
import { IAppUserAuthRepository } from '../../../../repositories/app-use-auth-repository';
import { ResetPasswordUsecase } from './reset-password.usecase';
import { CustomError } from '../../../../../../../errors/custom.error';

export class ResetPasswordController {
    constructor(
            private appUserAuthRepository: IAppUserAuthRepository,
        ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // 1. Extração dos dados da requisição
            // O token vem da URL (query param) e a senha do corpo (JSON)
            const { token } = request.query;
            const { newPassword } = request.body;

            // 2. Definição do schema de validação (Zod)
            // Combinamos os dados em um único objeto para validar
            const schema = z.object({
                token: z.string({ required_error: "O token de redefinição é obrigatório." })
                        .min(1, "Token inválido."),
                newPassword: z.string({ required_error: "A nova senha é obrigatória." })
                           .min(8, "A senha deve ter no mínimo 8 caracteres.")
                           // Você pode adicionar mais regras de força de senha aqui:
                           // .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiúscula.")
                           // .regex(/[0-9]/, "A senha deve ter pelo menos um número.")
            });

            // 3. Validação dos dados
            // Passamos os dados brutos extraídos para o Zod
            const validation = schema.safeParse({ token, newPassword });

            if (!validation.success) {
                // Retorna 400 Bad Request se a entrada for inválida
                return response.status(400).json({
                    error: "Dados de entrada inválidos.",
                    details: validation.error.flatten().fieldErrors,
                });
            }

            // Dados validados e tipados
            const data = validation.data;

            // 4. Execução do UseCase
            const usecase = new ResetPasswordUsecase(
                this.appUserAuthRepository,
            );
            await usecase.execute({
                token: data.token,
                newPassword: data.newPassword
            });

            // 5. Resposta de Sucesso
            return response.status(200).json({
                message: "Sua senha foi redefinida com sucesso. Você já pode fazer login com a nova senha."
            });

        } catch (error: any) {
            // Tratamento de erros
            if (error instanceof CustomError) {
                // Erros de domínio conhecidos (token inválido, expirado, usuário não encontrado)
                return response.status(error.statusCode).json({
                    error: error.message
                });
            }

            // Logs de erro inesperado para monitoramento
            console.error('[ResetPasswordController] Erro inesperado:', error);

            // Erro genérico de servidor
            return response.status(500).json({
                error: "Ocorreu um erro interno ao processar a redefinição de senha."
            });
        }
    }
}
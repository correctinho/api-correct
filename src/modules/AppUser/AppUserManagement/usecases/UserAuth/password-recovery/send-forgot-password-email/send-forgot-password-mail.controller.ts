import { Request, Response } from 'express';
import { z } from 'zod';
import { CustomError } from '../../../../../../../errors/custom.error';
import { IAppUserAuthRepository } from '../../../../repositories/app-use-auth-repository';
import { IMailProvider } from '../../../../../../../infra/providers/MailProvider/models/IMailProvider';
import { SendForgotPasswordMailUsecase } from './send-forgot-password-mail.usecase';

export class SendForgotPasswordController {
    constructor(
            // Injeção das dependências necessárias
            private appUserAuthRepository: IAppUserAuthRepository,
            private mailProvider: IMailProvider
        ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // 1. Definição do schema de validação da entrada
            // Esperamos apenas um campo 'email' válido no corpo.
            const schema = z.object({
                email: z.string({ required_error: "O e-mail é obrigatório." })
                        .email("Formato de e-mail inválido."),
            });

            
            

            // 2. Validação dos dados recebidos
            const validation = schema.safeParse(request.body);
            if (!validation.success) {
                // Se o e-mail for inválido ou não for enviado, retorna 400 Bad Request.
                return response.status(400).json({
                    error: "Dados de entrada inválidos.",
                    details: validation.error.flatten().fieldErrors,
                });
            }

            // Dados validados
            const { email } = validation.data;

            // 3. Execução do UseCase
            // O UseCase lida com a lógica de buscar o usuário, gerar o token e enviar o e-mail.
            // Se o usuário não existir, ele finaliza silenciosamente sem erro.
            const usecase = new SendForgotPasswordMailUsecase(
                this.appUserAuthRepository,
                this.mailProvider
            );

            await usecase.execute(email);

            // 4. Resposta de Sucesso Genérica (Segurança)
            // Sempre retornamos 200 OK com a mesma mensagem para evitar que atacantes
            // descubram se um e-mail está cadastrado ou não na base.
            return response.status(200).json({
                message: "Se o endereço informado estiver cadastrado em nossa base, você receberá um e-mail com as instruções para redefinição de senha em instantes. Verifique também sua caixa de spam."
            });

        } catch (error) {
            // Tratamento de erros
            if (error instanceof CustomError) {
                // Erros conhecidos lançados pelo UseCase (ex: falha no provedor de e-mail)
                return response.status(error.statusCode).json({
                    error: error.message
                });
            }

            // Logs de erro inesperado para monitoramento
            console.error('[SendForgotPasswordController] Erro inesperado:', error);

            return response.status(500).json({
                error: "Ocorreu um erro interno no servidor. Tente novamente mais tarde."
            });
        }
    }
}
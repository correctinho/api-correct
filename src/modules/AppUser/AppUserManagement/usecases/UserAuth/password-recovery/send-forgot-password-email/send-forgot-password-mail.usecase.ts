import { CustomError } from '../../../../../../../errors/custom.error';
import { IMailProvider } from '../../../../../../../infra/providers/MailProvider/models/IMailProvider';
import { IAppUserAuthRepository } from '../../../../repositories/app-use-auth-repository';

// DTO de entrada: apenas o e-mail é necessário para iniciar o processo
export interface SendForgotPasswordMailDTO {
    email: string;
}

export class SendForgotPasswordMailUsecase {
    constructor(
        // Injeção das dependências necessárias
        private appUserAuthRepository: IAppUserAuthRepository,
        private mailProvider: IMailProvider
    ) {}

    async execute(email: string): Promise<void> {
        // 1. Validação básica de entrada
        if (!email) {
            throw new CustomError('E-mail is required.', 400);
        }

        // 2. Buscar o usuário no banco pelo e-mail fornecido
        const userEntity = await this.appUserAuthRepository.findByEmail(email);
        // --- MEDIDA DE SEGURANÇA CRÍTICA ---
        // Prevenção contra Enumeração de Usuários:
        // Se o e-mail não estiver cadastrado, NÃO retornamos um erro específico (ex: "Usuário não encontrado").
        // Em vez disso, finalizamos a execução silenciosamente (retornando void), como se o processo tivesse dado certo.
        // Isso impede que atacantes descubram se um e-mail específico possui conta no sistema.
        if (!userEntity) {
            // Log interno para debug/auditoria, mas nada para o cliente.
            console.log(
                `[ForgotPassword] Solicitação recebida para e-mail não cadastrado: ${email}. Ignorando silenciosamente.`
            );
            return;
        }

        // 3. Gerar o token de redefinição e definir a data de expiração.
        // Chamamos o método de domínio da entidade. Isso atualizará o estado interno da entidade `userEntity`.
        const resetToken = userEntity.generatePasswordResetToken();

        // 4. Persistir o novo estado (token e expiração) no banco de dados.
        // O método update do repositório deve salvar os campos password_reset_token e password_reset_expires_at.
        await this.appUserAuthRepository.updatePassword(userEntity);

        // 5. Construir e enviar o e-mail com o link
        try {
            const frontendBaseUrl = process.env.FRONTEND_URL;

            if (!frontendBaseUrl) {
                // Log de erro crítico para o desenvolvedor (não vaza para o cliente)
                console.error(
                    'CRITICAL ERROR: FRONTEND_URL is not defined in .env'
                );
                // Interrompe o fluxo para não enviar um e-mail com link quebrado
                return;
            }

            const resetRoute = '/reset-password';
            const resetLink = `${frontendBaseUrl}${resetRoute}?token=${resetToken}`;

            // Template HTML do e-mail
            const emailBody = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #012B42; text-align: center;">Redefinição de Senha - MegaApp</h2>
                    <p>Olá,</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no MegaApp.</p>
                    <p>Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha:</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" style="background-color: #00D4AA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Redefinir Minha Senha
                        </a>
                    </div>
                    <p style="font-size: 14px;">Por segurança, este link é válido por apenas <strong>1 hora</strong>.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #777; text-align: center;">Se você não solicitou esta alteração, por favor ignore este e-mail. Sua senha atual permanecerá a mesma e sua conta está segura.</p>
                </div>
            `;

            //Envio usando o provedor configurado (Titan)
            await this.mailProvider.sendMail({
                to: userEntity.email,
                subject: 'Ação Necessária: Redefinição de Senha do MegaApp',
                body: emailBody,
                from: {
                    name: 'Equipe MegaApp',
                    address: 'nao-responda@correct.com.br',
                },
            });

            console.log(
                `[ForgotPassword] E-mail de redefinição enviado com sucesso para: ${email}`
            );
        } catch (error) {
            // Se houver falha no envio do e-mail, logamos o erro crítico.
            console.error(
                `[ForgotPassword] ERRO CRÍTICO: Falha ao enviar e-mail para ${email}:`,
                error
            );

            // Neste caso, podemos lançar um erro genérico para o usuário tentar novamente,
            // pois o token foi gerado mas não chegou até ele.
            throw new CustomError(
                'Houve um problema ao enviar o e-mail de recuperação. Por favor, tente novamente em alguns minutos.',
                500
            );
        }
    }
}

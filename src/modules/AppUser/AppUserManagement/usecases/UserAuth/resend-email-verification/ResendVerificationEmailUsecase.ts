import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";

// DTO de entrada simples
interface ResendVerificationInputDTO {
    email: string;
}

export class ResendVerificationEmailUsecase {
    constructor(
        private appUserAuthRepository: IAppUserAuthRepository,
        private mailProvider: IMailProvider
    ) {}

    async execute(document: string) {
        if(!document) throw new CustomError("Documento é obrigatório.", 400);
        // 1. Buscar o usuário pelo e-mail
        const userEntity = await this.appUserAuthRepository.findByDocument(document);

        const email = userEntity.email
        if (!userEntity || userEntity.is_email_verified) {
            console.log(`[ResendVerification] Tentativa para ${email}, mas usuário não existe ou já está verificado. Ignorando.`);
            return;
        }

        // 2. Gerar um NOVO token e nova expiração (a entidade lida com isso)
        // Isso sobrescreve o token antigo na memória da entidade.
        userEntity.generateEmailVerificationToken();

        // 3. Salvar o novo token no banco de dados
        await this.appUserAuthRepository.update(userEntity);


        // 4. Reenviar o E-mail (Lógica similar ao SignUp)
        try {
             if (!userEntity.email_verification_token) {
                 throw new Error("Falha ao gerar novo token.");
             }

             const frontendBaseUrl = process.env.FRONTEND_URL;

            if (!frontendBaseUrl) {
                // Log de erro crítico para o desenvolvedor (não vaza para o cliente)
                console.error(
                    'CRITICAL ERROR: FRONTEND_URL is not defined in .env'
                );
                return;
            }
             const validationRoute = '/validar-email';
             const validationLink = `${frontendBaseUrl}${validationRoute}?token=${userEntity.email_verification_token}`;

             // (Idealmente, extrair este template para um arquivo compartilhado para não duplicar código)
             const emailBody = `
                 <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                     <h2>Olá novamente!</h2>
                     <p>Você solicitou um novo link de verificação para sua conta no MegaApp.</p>
                     <p>Clique no botão abaixo para validar seu e-mail:</p>
                     <div style="text-align: center; margin: 30px 0;">
                         <a href="${validationLink}" style="background-color: #00D4AA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                             Verificar E-mail Agora
                         </a>
                     </div>
                     <p>Este novo link é válido por 24 horas e invalida os anteriores.</p>
                     <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                     <p style="font-size: 12px; color: #777;">Se você não solicitou este reenvio, ignore este e-mail. Sua conta permanece segura.</p>
                 </div>
             `;

             await this.mailProvider.sendMail({
                to: userEntity.email,
                subject: "Confirme seu email",
                body: emailBody,
                // O Provider lerá este endereço, achará a credencial do 'nao-responda' e usará ela.
                from: {
                    name: 'Equipe MegaApp',
                    address: 'nao-responda@correct.com.br'
                }
});

             console.log(`[ResendVerification] Novo e-mail enviado para ${email}`);

             return {
                email: userEntity.email
             }

        } catch (error) {
             console.error(`[ResendVerification] ERRO CRÍTICO ao enviar para ${email}:`, error);
             // Aqui podemos lançar erro, pois o usuário solicitou ativamente e falhou.
             throw new CustomError("Erro ao tentar reenviar o e-mail. Tente novamente mais tarde.", 500);
        }
    }
}
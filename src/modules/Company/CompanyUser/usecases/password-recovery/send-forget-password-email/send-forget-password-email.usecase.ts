import { CustomError } from "../../../../../../errors/custom.error";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";
import { CompanyUserEntity } from "../../../entities/company-user.entity";
import { ICompanyUserRepository } from "../../../repositories/company-user.repository";
import { SendCompanyForgotPasswordMailDTO } from "./dto/send-forget-password-email.dto";
import { getRecoverPasswordEmailTemplate } from "./emails/recover-password.email";

// Enum para facilitar leitura (pode importar do Prisma se preferir)
enum BusinessTypeOptions {
  EMPREGADOR = 'empregador',
  COMERCIO = 'comercio',
  AUTONOMO_COMERCIO = 'autonomo_comercio',
  EMPREGADOR_COMERCIO = 'empregador_comercio'
}

export class SendCompanyForgotPasswordMailUsecase {
    constructor(
        private companyUserRepository: ICompanyUserRepository,
        private mailProvider: IMailProvider
    ) {}

    async execute({ email, portal }: SendCompanyForgotPasswordMailDTO): Promise<void> {
        // 1. Validação básica
        if (!email) throw new CustomError('O e-mail é obrigatório.', 400);
        if (!portal) throw new CustomError('A origem do portal é obrigatória.', 400);

        // 2. Buscar dados brutos
        const userRaw = await this.companyUserRepository.findByEmail(email);

        // --- SEGURANÇA: Retorno silencioso se não achar ---
        if (!userRaw) {
            console.log(`[ForgotPass] E-mail não encontrado: ${email}`);
            return;
        }

        // 3. Hidratação Manual
        const userEntity = new CompanyUserEntity({
            uuid: userRaw.uuid,
            business_info_uuid: userRaw.business_info_uuid,
            is_admin: userRaw.is_admin,
            document: userRaw.document,
            name: userRaw.name,
            email: userRaw.email,
            user_name: userRaw.user_name,
            password: userRaw.password,
            function: userRaw.function,
            permissions: userRaw.permissions,
            status: userRaw.status,
            password_reset_token: userRaw.password_reset_token,
            password_reset_expires_at: userRaw.password_reset_expires_at,
            business_type: userRaw.business_type 
        });

        if (userEntity.status !== 'active') return;

        // 4. LÓGICA DE VALIDAÇÃO DE TIPO vs PORTAL
        const type = userEntity.business_type;
        let frontendUrl = '';

        // Regra: Se a empresa NÃO tem permissão para aquele portal, ignoramos (segurança)
        if (portal === 'employer') {
            const isEmployer = type === BusinessTypeOptions.EMPREGADOR || type === BusinessTypeOptions.EMPREGADOR_COMERCIO;
            
            if (!isEmployer) {
                console.log(`[ForgotPass] Usuário do tipo ${type} tentou resetar senha pelo portal Employer. Bloqueado.`);
                return; 
            }
            frontendUrl = process.env.EMPLOYER_FRONTEND_URL!; // URL do Empregador

        } else if (portal === 'partner') {
            const isPartner = type === BusinessTypeOptions.COMERCIO || 
                              type === BusinessTypeOptions.AUTONOMO_COMERCIO || 
                              type === BusinessTypeOptions.EMPREGADOR_COMERCIO;

            if (!isPartner) {
                console.log(`[ForgotPass] Usuário do tipo ${type} tentou resetar senha pelo portal Partner. Bloqueado.`);
                return;
            }
            frontendUrl = process.env.PARTNER_FRONTEND_URL!; // URL do Parceiro
        }

        if (!frontendUrl) {
            console.error(`CRITICAL: URL do frontend não definida para o portal ${portal}`);
            return;
        }

        // 5. Gera Token e Salva
        const resetToken = userEntity.generatePasswordResetToken();
        await this.companyUserRepository.updateUser(userEntity);

        // 6. Envia E-mail com o link correto
        try {
            const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

            // Geramos o HTML chamando a função do arquivo externo
            // Usamos userEntity.name ou um fallback caso o nome seja nulo
            const emailHtml = getRecoverPasswordEmailTemplate(
                userEntity.name || 'Usuário', 
                resetLink
            );

            await this.mailProvider.sendMail({
                to: userEntity.email!, 
                subject: 'Ação Necessária: Redefinição de Senha - Syscorrect',
                body: emailHtml,
                from: {
                    name: 'Syscorrect Segurança',
                    address: process.env.MAIL_ACCOUNT_NOREPLY_USER, 
                },
            });

            console.log(`[CompanyForgotPassword] E-mail enviado com sucesso para: ${email}`);

        } catch (error) {
            console.error(`[CompanyForgotPassword] Erro ao enviar e-mail para ${email}:`, error);
            // É importante relançar o erro ou tratar conforme sua estratégia de erro (aqui lançamos 500)
            throw new CustomError('Erro ao processar envio de e-mail. Tente novamente.', 500);
        }
    }
}
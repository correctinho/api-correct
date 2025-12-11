import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { AppUserAuthProps, AppUserAuthSignUpEntity } from "../../../entities/app-user-auth.entity";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { InputCreateAppUserDTO, OutputCreateappUserDTO } from "../../../../app-user-dto/app-user.dto";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { IMailProvider } from "../../../../../../infra/providers/MailProvider/models/IMailProvider";
import { create } from "lodash";

export class AppUserAuthSignUpUsecase {
    constructor(
        private appUserSingUpRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository,
        private mailProvider: IMailProvider
    ) { }

    async execute(data: InputCreateAppUserDTO): Promise<OutputCreateappUserDTO> {
        const authEntity = new AppUserAuthSignUpEntity(data)

        const [findUserByDocument, findUserByEmail] = await Promise.all([
            this.appUserSingUpRepository.findByDocument(authEntity.document),
            this.appUserSingUpRepository.findByEmail(authEntity.email)
        ]);

        //check if app user is already registered by document
        if (findUserByDocument) throw new CustomError("User already has an account", 409)

        //find user by email
        if (findUserByEmail) throw new CustomError("Email already in use", 409)

        //check if user was already previously registered
        const findUser = await this.appUserInfoRepository.findByDocumentUserInfo(authEntity.document)
        if (findUser) {
            authEntity.changeUserInfo(new Uuid(findUser.uuid))
        }
        authEntity.generateEmailVerificationToken();

        const entityPropsToSave: AppUserAuthProps = {
            uuid: authEntity.uuid,
            user_info_uuid: authEntity.user_info_uuid,
            document: authEntity.document,
            email: authEntity.email,
            password: authEntity.password, // Será hashada dentro do create
            is_active: authEntity.is_active,
            is_email_verified: authEntity.is_email_verified,
            email_verification_token: authEntity.email_verification_token,
            email_verification_expires_at: authEntity.email_verification_expires_at
        };

        const createEntity = await AppUserAuthSignUpEntity.create(entityPropsToSave)

        await this.appUserSingUpRepository.create(createEntity)

        try {
            // Se não houver token (erro inesperado), não tenta enviar.
            if (!createEntity.email_verification_token) {
                throw new Error("Token de verificação não foi gerado corretamente.");
            }

            // 1. Montar o link para o Frontend (conforme suas definições)
            const frontendBaseUrl = 'https://megaapp.correct.com.br';
            const validationRoute = '/validar-email';
            const validationLink = `${frontendBaseUrl}${validationRoute}?token=${createEntity.email_verification_token}`;

            // 2. Montar o corpo do e-mail HTML
            const emailBody = `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <h2>Bem-vindo(a) ao MegaApp!</h2>
                    <p>Olá, obrigado por se cadastrar.</p>
                    <p>Para garantir a segurança da sua conta e acessar todos os recursos, por favor, confirme seu endereço de e-mail clicando no botão abaixo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${validationLink}" style="background-color: #00D4AA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                            Confirmar meu E-mail
                        </a>
                    </div>
                    <p>Este link é válido por 24 horas.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">Se você não realizou este cadastro, por favor ignore este e-mail.</p>
                </div>
            `;

            // 3. Chamar o provedor para enviar
            // Usamos 'await' para garantir que a tentativa de envio ocorra antes de responder ao cliente.
            // Se falhar, o catch captura, loga o erro crítico, mas não quebra o cadastro.
            await this.mailProvider.sendMail({
                to: createEntity.email,
                subject: "Confirme seu cadastro no MegaApp",
                body: emailBody,
                // Remetente específico solicitado por você
                from: {
                    name: 'Equipe MegaApp',
                    address: 'nao-responda@correct.com.br'
                }
            });

            console.log(`[SignUp] E-mail de verificação enviado com sucesso para ${createEntity.email}`);

        } catch (error) {
            // Log crítico: O cadastro foi feito, mas o e-mail falhou.
            // Monitoramento deve pegar isso. O usuário precisará pedir reenvio.
            console.error(`[SignUp] ERRO CRÍTICO: Falha ao enviar e-mail de verificação para ${createEntity.email}. Erro:`, error);
            // Não lançamos o erro novamente (throw error) para não desfazer a transação do cadastro.
        }
        return {
            uuid: createEntity.uuid.uuid,
            user_info_uuid: createEntity.user_info_uuid,
            document: createEntity.document,
            email: createEntity.email,
            is_active: createEntity.is_active,
        }

    }


}

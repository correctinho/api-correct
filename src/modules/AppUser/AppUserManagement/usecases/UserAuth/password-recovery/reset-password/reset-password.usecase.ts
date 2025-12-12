import { Uuid } from "../../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../../errors/custom.error";
import { IAppUserAuthRepository } from "../../../../repositories/app-use-auth-repository";
import { ResetPasswordDTO } from "./reset-password.dto"; // Assumindo que criou este arquivo
import jwt from 'jsonwebtoken';

export class ResetPasswordUsecase {
    constructor(
        private appUserAuthRepository: IAppUserAuthRepository,
        // private passwordCrypto: IPasswordCrypto // Removido: a responsabilidade do hash é da entidade
    ) {}

    async execute({ token, newPassword }: ResetPasswordDTO): Promise<void> {
        // 1. Validações básicas de entrada
        if (!token) throw new CustomError("Token é obrigatório.", 400);
        // Adicione regras de senha forte aqui se necessário
        if (!newPassword || newPassword.length < 6) {
            throw new CustomError("A nova senha deve ter pelo menos 6 caracteres.", 400);
        }

        // 2. Decodificar o JWT APENAS para pegar o ID (sem verificar expiração da lib)
        const decoded = jwt.decode(token) as { sub: string, type: string } | null;

        if (!decoded || !decoded.sub || decoded.type !== 'password_reset') {
            throw new CustomError("Token inválido ou malformado.", 400);
        }

        const userUuid = new Uuid(decoded.sub);

        // 3. Buscar o usuário no banco
        const userEntity = await this.appUserAuthRepository.find(userUuid);
        console.log('User entity fetched for password reset:', userEntity);
        if (!userEntity) {
            throw new CustomError("Usuário não encontrado.", 404);
        }

        // --- VALIDAÇÃO MANUAL CONTRA O BANCO DE DADOS ---
        // Essa lógica ignora o relógio do token e confia no relógio do banco.

        // a) Verifica se existe um token ativo no banco e se ele é IDÊNTICO ao enviado.
        // Se for diferente, significa que um novo foi gerado depois, invalidando este.
        if (!userEntity.password_reset_token || userEntity.password_reset_token !== token) {
            throw new CustomError("Token inválido ou já utilizado. Solicite uma nova redefinição.", 400);
        }

        // b) Verifica a expiração salva no banco comparando com a hora atual do servidor.
        if (!userEntity.password_reset_expires_at || new Date() > userEntity.password_reset_expires_at) {
             // Opcional: Limpar o token expirado por segurança e salvar
             userEntity.clearPasswordResetToken();
             await this.appUserAuthRepository.updatePassword(userEntity);
             throw new CustomError("O link de redefinição expirou. Por favor, solicite um novo.", 400);
        }
        // ---------------------------------------------------------


        // 4. Efetuar a troca de senha
        // IMPORTANTE: Assumimos que seu método entity.changePassword() JÁ FAZ O HASH da senha internamente.
        // Se não fizer, você precisaria reinjetar o IPasswordCrypto e fazer o hash aqui antes.
        await userEntity.changePassword(newPassword);

        // 5. Limpar o token usado para impedir reuso imediato
        userEntity.clearPasswordResetToken();

        // 6. Salvar as alterações no banco usando o método especializado
        await this.appUserAuthRepository.updatePassword(userEntity);

        console.log(`[ResetPassword] Senha alterada com sucesso para o usuário ${userEntity.uuid.uuid}`);
    }
}
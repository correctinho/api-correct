import jwt from 'jsonwebtoken';
import { ICompanyUserRepository } from '../../../repositories/company-user.repository';
import { ResetCompanyPasswordDTO } from './dto/reset-company-user-password.dto';
import { CustomError } from '../../../../../../errors/custom.error';
import { Uuid } from '../../../../../../@shared/ValueObjects/uuid.vo';
import { CompanyUserEntity } from '../../../entities/company-user.entity';

export class ResetCompanyPasswordUsecase {
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) {}

    async execute({ token, newPassword }: ResetCompanyPasswordDTO): Promise<void> {
        // 1. Validações básicas
        if (!token) throw new CustomError("Token é obrigatório.", 400);
        
        if (!newPassword || newPassword.length < 6) {
            throw new CustomError("A nova senha deve ter pelo menos 6 caracteres.", 400);
        }

        // 2. Decodificar JWT
        const decoded = jwt.decode(token) as { sub: string, type: string } | null;

        if (!decoded || !decoded.sub || decoded.type !== 'password_reset') {
            throw new CustomError("Token inválido ou malformado.", 400);
        }

        const userUuid = new Uuid(decoded.sub);

        // 3. Buscar dados brutos (Raw)
        const userRaw = await this.companyUserRepository.findById(userUuid.uuid);
        
        if (!userRaw) {
            throw new CustomError("Usuário administrativo não encontrado.", 404);
        }

        // --- HIDRATAÇÃO MANUAL (O Workaround) ---
        const userEntity = new CompanyUserEntity({
            uuid: userRaw.uuid,
            business_info_uuid: userRaw.business_info_uuid,
            is_admin: userRaw.is_admin,
            document: userRaw.document,
            name: userRaw.name,
            email: userRaw.email,
            user_name: userRaw.user_name,
            password: userRaw.password, // Importante manter a senha antiga por enquanto
            function: userRaw.function,
            permissions: userRaw.permissions,
            status: userRaw.status,
            // Campos de Reset
            password_reset_token: userRaw.password_reset_token,
            password_reset_expires_at: userRaw.password_reset_expires_at,
            // Campo de Tipo de Negócio (se tiver adicionado no passo anterior)
            business_type: userRaw.business_type
        });

        // 4. Validação Segurança Estrita
        // Agora acessamos via getters ou backing fields se for public, mas como é classe, funciona.
        if (!userEntity.password_reset_token || userEntity.password_reset_token !== token) {
            throw new CustomError("Este link de redefinição já foi utilizado ou é inválido.", 400);
        }

        // 5. Validação de Expiração
        if (!userEntity.password_reset_expires_at || new Date() > userEntity.password_reset_expires_at) {
             // Como userEntity agora é uma CLASSE, esse método vai funcionar
             userEntity.clearPasswordResetToken();
             await this.companyUserRepository.updateUser(userEntity);
             throw new CustomError("O link expirou. Solicite um novo.", 400);
        }

        // 6. Trocar Senha (Método da Classe)
        await userEntity.updatePassword(newPassword); 

        // 7. Limpar Token (Método da Classe)
        userEntity.clearPasswordResetToken();

        // 8. Salvar
        await this.companyUserRepository.updateUser(userEntity);

        console.log(`[CompanyResetPassword] Senha alterada para admin ${userEntity.uuid.uuid}`);
    }
}
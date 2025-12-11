import jwt from 'jsonwebtoken';
import { IAppUserAuthRepository } from '../../../repositories/app-use-auth-repository';
import { CustomError } from '../../../../../../errors/custom.error';
import { Uuid } from '../../../../../../@shared/ValueObjects/uuid.vo';

// Interface de entrada simples
interface InputVerifyEmailDTO {
    token: string;
}

export class VerifyEmailUsecase {
    constructor(
        private appUserAuthRepository: IAppUserAuthRepository
    ) {}

    async execute({ token }: InputVerifyEmailDTO): Promise<void> {
        // 1. Decodificar o JWT "na força bruta" apenas para pegar o ID do usuário (subject).
        const decoded = jwt.decode(token) as { sub: string, type: string } | null;

        if (!decoded || !decoded.sub || decoded.type !== 'email_validation') {
             // Se o token estiver malformado ou não for do tipo certo.
            throw new CustomError("Token de verificação inválido.", 400);
        }

        const userUuid = new Uuid(decoded.sub);

        // 2. Buscar o usuário no banco pelo ID.
        const userEntity = await this.appUserAuthRepository.find(userUuid);

        if (!userEntity) {
            throw new CustomError("Usuário não encontrado.", 404);
        }

        // 3. Validações de Regra de Negócio (usando os dados do BANCO)

        // a) Verifica se já não está verificado
        if (userEntity.is_email_verified) {
             return;
        }

        // b) Verifica se o token enviado bate exatamente com o token salvo no banco
        if (userEntity.email_verification_token !== token) {
            throw new CustomError("Token de verificação inválido ou já utilizado.", 400);
        }

        // c) Verifica a expiração (Data atual > Data de expiração do banco)
        if (userEntity.email_verification_expires_at && new Date() > userEntity.email_verification_expires_at) {
             // Aqui poderíamos ter uma lógica para gerar um novo token, mas por enquanto, só erro.
             throw new CustomError("O link de verificação expirou. Solicite um novo.", 400);
        }

        // 4. Se passou por tudo, chama o método da entidade para marcar como verificado.
        userEntity.verifyEmail();

        // 5. Salva a alteração no banco.
        // IMPORTANTE: Seu repositório precisa ter um método 'update' funcional.
        await this.appUserAuthRepository.update(userEntity);
    }
}
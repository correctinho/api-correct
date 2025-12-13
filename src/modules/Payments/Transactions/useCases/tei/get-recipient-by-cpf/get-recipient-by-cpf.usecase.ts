import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserInfoRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";

interface RequestDTO {
    cpf: string;
    payerUserInfoUuid: string; // UUID de quem está pagando (para evitar transferir para si mesmo)
}

interface ResponseDTO {
    user_info_uuid: string;
    name: string;
    maskedCpf: string;
}

export class GetRecipientByCpfUsecase {
    constructor(private userInfoRepository: IAppUserInfoRepository) {}

    async execute({ cpf, payerUserInfoUuid }: RequestDTO): Promise<ResponseDTO> {
        if (!cpf) {
            throw new CustomError("CPF é obrigatório.", 400);
        }

        // 1. Limpeza básica do CPF recebido
        const cleanCpf = cpf.replace(/\D/g, '');

        if (cleanCpf.length !== 11) {
             throw new CustomError("CPF inválido.", 400);
        }

        // 2. Busca o recebedor usando o método otimizado
        const recipient = await this.userInfoRepository.findRecipientByDocument(cleanCpf);

        if (!recipient) {
            throw new CustomError("Usuário não encontrado para este CPF.", 404);
        }

        // 3. Validação: Não permitir transferir para si mesmo
        if (recipient.uuid === payerUserInfoUuid) {
             throw new CustomError("Você não pode realizar uma transferência para sua própria conta.", 400);
        }

        // 4. Mascarar o CPF para retorno visual (segurança adicional)
        // Ex: 12345678900 vira ***.456.789-**
        const maskedCpf = `***.${cleanCpf.substring(3, 6)}.${cleanCpf.substring(6, 9)}-**`;

        return {
            user_info_uuid: recipient.uuid, 
            name: recipient.full_name,
            maskedCpf: maskedCpf
        };
    }
}
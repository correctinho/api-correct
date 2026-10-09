import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputActivateBatchDTO } from "./dto/activate-user-items-batch.dto";

export class ActivateUserItemsBatchUsecase {
    constructor(
        private appUserItemRepository: IAppUserItemRepository
    ) {}

    async execute(input: InputActivateBatchDTO): Promise<void> {
        // 1. Defesa Inicial: Garante que o array existe
        if (!input.users || input.users.length === 0) {
             throw new CustomError("Lista de usuários obrigatória.", 400);
        }

        // 2. Sanitização: Filtra apenas strings válidas (remove null, undefined e strings vazias)
        // O método .filter(id => id) remove qualquer valor 'falsy'
        const validUsers = input.users.filter(u => u && u.user_info_uuid && typeof u.user_info_uuid === 'string');

        // 3. Validação Real: Se após filtrar não sobrou ninguém, lança o erro
        if (validUsers.length === 0) {
            // Se o front mandou [null, undefined], o validUsers será [], caindo aqui.
            throw new CustomError("Nenhum usuário válido selecionado para ativação.", 400);
        }

        // 4. Chama o repositório passando APENAS os UUIDs limpos
        await this.appUserItemRepository.activateManyByBusinessAndItem(
            input.business_info_uuid,
            input.item_uuid,
            validUsers 
        );
    }
}
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { OutputListCollaboratorsDTO } from "./dto/list-collaborators-by-benefit.dto";

export class ListCollaboratorsByBenefitUsecase {
    constructor(
        private appUserItemRepository: IAppUserItemRepository
    ) {}

    async execute(input: {
        business_info_uuid: string,
        item_uuid: string,
        page: number,
        limit: number,
        status?: string // 'active' | 'inactive' | 'all'
    }): Promise<OutputListCollaboratorsDTO> {
        // 1. Chama o repositório
        const { items, total } = await this.appUserItemRepository.findAllByItemAndBusinessPaginated({
            business_info_uuid: input.business_info_uuid,
            item_uuid: input.item_uuid,
            page: input.page,
            limit: input.limit,
            status: input.status
        });
        // 2. Mapeia para o DTO (Correção aqui)
        const collaborators = items.map(userItem => ({
            user_item_uuid: userItem.uuid.uuid,
            user_info_uuid: userItem.user_info_uuid.uuid, 
            name: userItem.UserInfo?.full_name || "Sem Nome",
            
            // CORREÇÃO 1: O nome da chave deve ser 'document' para bater com o DTO, não 'cpf'
            // Adicionei um fallback || '' para garantir que seja string
            document: userItem.UserInfo?.document || '', 
            
            status: userItem.status, 
            
            // Priorizamos o nome que vem do Join (BenefitGroups) se existir, senão usa o da entidade
            group_name: userItem.BenefitGroups?.group_name || userItem.group_name || "Sem Grupo",
            
            balance: userItem.balance, 
            admitted_at: userItem.created_at 
        }));
        // 3. Monta o Retorno com Meta (Correção aqui)
        return {
            collaborators,
            meta: {
                total,
                page: input.page,
                last_page: Math.ceil(total / input.limit),
                
                per_page: input.limit 
            }
        };
    }
}
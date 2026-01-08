import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { InputPreviewRechargeOrderDTO, OutputPreviewRechargeOrderDTO } from "./dto/preview-recharge-order.dto";

export class PreviewRechargeOrderUsecase {
    constructor(
        private appUserItemRepository: IAppUserItemRepository
    ) {}

    async execute(input: InputPreviewRechargeOrderDTO): Promise<OutputPreviewRechargeOrderDTO> {
        if(!input.item_uuid) throw new CustomError("Item UUID is required", 400);
        // 1. Busca todos os vínculos ATIVOS dessa empresa para esse benefício
        // O Repositório DEVE incluir o relacionamento com 'BenefitGroups' e 'UserInfo'
        const activeUserItems = await this.appUserItemRepository.findAllActiveByBusinessAndItem(
            input.business_info_uuid,
            input.item_uuid
        );
        
        if (!activeUserItems || activeUserItems.length === 0) {
            return {
                total_suggested: 0,
                total_count: 0,
                items: []
            };
        }
        
        if(activeUserItems[0].business_info_uuid.uuid !== input.business_info_uuid) {
            throw new CustomError("Business Info UUID does not match", 400);
        }
        // 2. Mapeia e calcula os valores baseados no Grupo
        const items = activeUserItems.map(userItem => {
            // Se o usuário tem um grupo vinculado, usa o valor do grupo. Se não, 0.
            const groupValueCents = userItem.BenefitGroups?.value || 0;
            const suggestedAmountReais = groupValueCents / 100;
            return {
                user_item_uuid: userItem.uuid.uuid,
                user_name: userItem.UserInfo?.full_name || "Sem Nome",
                user_document: userItem.UserInfo?.document || "",
                group_name: userItem.BenefitGroups?.group_name || "Sem Grupo",
                suggested_amount: suggestedAmountReais
            };
        });

        // 3. Calcula o total inicial
        const totalSuggested = items.reduce((sum, item) => sum + item.suggested_amount, 0);

        return {
            total_suggested: totalSuggested,
            total_count: items.length,
            items: items
        };
    }
}
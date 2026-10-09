
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputUpdateUserItemLimitDTO } from "./dto/update-user-item-limit.dto";

export class UpdateUserItemLimitUsecase {
    constructor(private appUserItemRepository: IAppUserItemRepository) { }

    async execute(input: InputUpdateUserItemLimitDTO): Promise<void> {
        if (!input.user_item_uuid || !input.business_info_uuid || input.new_limit === undefined) {
            throw new CustomError("Dados incompletos para atualizar o limite.", 400);
        }

        const userItem = await this.appUserItemRepository.find(new Uuid(input.user_item_uuid));
        if (!userItem) {
            throw new CustomError("Benefício não encontrado.", 404);
        }

        if (userItem.business_info_uuid.uuid !== input.business_info_uuid) {
            throw new CustomError("Você não tem permissão para alterar este benefício.", 403);
        }

        if (userItem.status !== 'active') {
            throw new CustomError("O benefício precisa estar ativo para ter o limite alterado.", 400);
        }

        userItem.changeBalance(input.new_limit / 100); // changeBalance multiplies by 100, so we pass reais
        await this.appUserItemRepository.update(userItem);
    }
}

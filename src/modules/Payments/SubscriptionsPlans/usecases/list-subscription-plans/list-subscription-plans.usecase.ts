import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";

export class ListSubscriptionPlansUseCase {
    constructor(
        private subscriptionPlanRepository: ISubscriptionPlanRepository
    ) { }

    async execute(item_uuid: string) {
        const itemUuid = new Uuid(item_uuid);

        // Retorna um array (SubscriptionPlanEntity[])
        const plans = await this.subscriptionPlanRepository.findByItemUuid(itemUuid);

        // Mapeia o array, chamando o toJSON() de CADA entidade individualmente
        return plans.map(plan => plan.toJSON());
    }
}
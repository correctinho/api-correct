import { SubscriptionPlanEntity } from "../../entities/subscription-plan.entity";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { OutputListSubscriptionPlansDto } from "./dto/list-subscription-plans.dto";

export class ListSubscriptionPlansUseCase {
    constructor(private subscriptionPlanRepository: ISubscriptionPlanRepository) { }

    async execute(): Promise<OutputListSubscriptionPlansDto> {
        const plans = await this.subscriptionPlanRepository.findActivePlansByPayerType('USER');
        return plans.map(plan => plan.toJSON());
    }
}

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { OutputListSubscriptionPlansDto } from "./dto/list-subscription-plans.dto";

export class ListSubscriptionPlansAppUserUseCase {
    constructor(
        private subscriptionPlanRepository: ISubscriptionPlanRepository,
        private subscriptionRepository: ISubscriptionRepository
    ) { }

    async execute(userInfoUuid: string): Promise<OutputListSubscriptionPlansDto> {
        const plans = await this.subscriptionPlanRepository.findActivePlansByPayerType('USER');
        const userUuid = new Uuid(userInfoUuid);
        const activeSubscriptions = await this.subscriptionRepository.findActiveByUser(userUuid);

        return plans.map(plan => {
            const isHired = activeSubscriptions.some(sub => sub.subscription_plan_uuid.uuid === plan.uuid.uuid);
            return {
                ...plan.toJSON(),
                is_hired: isHired
            };
        });
    }
}

import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";
import { OutputListMySubscriptionsDTO } from "./list-my-subscriptions.dto";

export class ListMySubscriptionsUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository
    ) {}

    async execute(userUuid: string): Promise<OutputListMySubscriptionsDTO> {
        const userUuidVO = new Uuid(userUuid);
        
        const detailedSubscriptions = await this.subscriptionRepository.findDetailedByUser(userUuidVO);

        const subscriptions = detailedSubscriptions.map((sub: any) => ({
            uuid: sub.uuid,
            status: sub.status,
            start_date: sub.start_date,
            end_date: sub.end_date,
            next_billing_date: sub.next_billing_date,
            plan: {
                uuid: sub.SubscriptionPlan.uuid,
                name: sub.SubscriptionPlan.name,
                price: sub.SubscriptionPlan.price,
                billing_period: sub.SubscriptionPlan.billing_period,
            },
            program: sub.SubscriptionPlan.Item ? {
                uuid: sub.SubscriptionPlan.Item.uuid,
                name: sub.SubscriptionPlan.Item.name,
                img_url: sub.SubscriptionPlan.Item.img_url || null,
            } : null,
        }));

        return { subscriptions };
    }
}

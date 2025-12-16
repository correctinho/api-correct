import { SubscriptionEntity } from "../../entities/subscription.entity";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";

export class ListSubscriptionsUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async execute(): Promise<SubscriptionEntity[]> {
        return await this.subscriptionRepository.findAll();
    }
}

import { CustomError } from "../../../../../errors/custom.error";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";

export class GetAppUserSubscriptionsByAdminUsecase {
    constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

    async execute(userInfoUuid: string): Promise<any[]> {
        const userUuid = new Uuid(userInfoUuid);
        
        // Retorna todas as assinaturas detalhadas (ativas, canceladas, pendentes, etc.)
        const subscriptions = await this.subscriptionRepository.findDetailedByUser(userUuid);
        
        if (!subscriptions) return [];
        return subscriptions;
    }
}

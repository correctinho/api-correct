// modules/Payments/Subscriptions/usecases/cancel-subscription.usecase.ts

import { SubscriptionStatus } from "@prisma/client";
import { UserItemStatusEnum } from "../../../../AppUser/AppUserManagement/enums/user-item-status.enum";
import { ISubscriptionRepository } from "../../repositories/subscription.repository";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
// ... imports de repositórios e erros

export class CancelUserSubscriptionUsecase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) {}

    async execute(input: { subscriptionUuid: string, userId: string, reason: string }): Promise<void> {
        const subUuid = new Uuid(input.subscriptionUuid);
        const userUuid = new Uuid(input.userId);

        // 1. Buscar a Assinatura Ativa
        // É importante garantir que pertence ao usuário que está pedindo (se for self-service)
        const subscription = await this.subscriptionRepository.find(subUuid);

        if (!subscription) {
            throw new CustomError("Assinatura não encontrada.", 404);
        }

        if (subscription.user_info_uuid.uuid !== userUuid.uuid) {
            throw new CustomError("Permissão negada.", 403);
        }

        if (subscription.status !== SubscriptionStatus.ACTIVE) {
            throw new CustomError("Esta assinatura já está inativa ou cancelada.", 400);
        }

        // 2. Definir os novos estados
        // Se a intenção é remover o benefício IMEDIATAMENTE:
        const newSubStatus = SubscriptionStatus.CANCELED;
        // Aqui você decide se quer 'INACTIVE' (some do app) ou 'BLOCKED' (aparece bloqueado)
        // Como você disse "não tenha mais este benefício", 'INACTIVE' ou 'CANCELLED' é o ideal.
        const newItemStatus = UserItemStatusEnum.CANCELLED; 
        
        const now = new Date();

        // 3. Executar a Desativação Atômica
        await this.subscriptionRepository.cancelSubscriptionAndItem(
            subUuid.uuid,
            subscription.user_item_uuid.uuid,
            newSubStatus,
            newItemStatus,
            input.reason,
            now
        );
    }
}
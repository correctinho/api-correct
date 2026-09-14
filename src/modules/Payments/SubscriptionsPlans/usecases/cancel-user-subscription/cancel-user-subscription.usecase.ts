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

    async execute(input: { subscriptionUuid: string, userId: string, reason: string, isAdmin?: boolean }): Promise<void> {
        const subUuid = new Uuid(input.subscriptionUuid);
        const userUuid = new Uuid(input.userId);

        // 1. Buscar a Assinatura Ativa
        const subscription = await this.subscriptionRepository.find(subUuid);

        if (!subscription) {
            throw new CustomError("Assinatura ativa não encontrada para este benefício.", 404);
        }

        // Se não for admin, verifica se a assinatura pertence ao usuário que está solicitando
        if (!input.isAdmin && subscription.user_info_uuid.uuid !== userUuid.uuid) {
            throw new CustomError("Permissão negada.", 403);
        }

        // 2. Definir os novos estados (Cancelamento no fim do ciclo)
        const newSubStatus = SubscriptionStatus.CANCELED; // Cancela a renovação
        const newItemStatus = UserItemStatusEnum.TO_BE_CANCELLED; // Fica agendado para cancelar
        
        const now = new Date();
        const gracePeriodEndDate = subscription.next_billing_date || subscription.end_date || now;

        // 3. Executar a Atualização Atômica
        await this.subscriptionRepository.cancelSubscriptionAndItem(
            subscription.uuid.uuid,
            subscription.user_item_uuid.uuid,
            newSubStatus,
            newItemStatus,
            input.reason,
            now,
            gracePeriodEndDate
        );
    }
}
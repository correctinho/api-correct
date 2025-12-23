import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { AppUserItemEntity } from "../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TermAcceptanceEntity } from "../../../Terms/entities/term-acceptance.entity";
import { TransactionEntity } from "../../Transactions/entities/transaction-order.entity";
import { SubscriptionEntity } from "../entities/subscription.entity";

export interface ISubscriptionRepository extends RepositoryInterface<SubscriptionEntity> {
  // Útil para verificar se o usuário já não tem esse plano ativo antes de deixar comprar de novo
  findActiveByUserAndPlan(userUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null>;
  findActiveByBusinessAndPlan(businessUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null>
  upsert(entity: SubscriptionEntity): Promise<void>;
  // Busca todas as assinaturas ativas de um usuário
  findActiveByUser(userUuid: Uuid): Promise<SubscriptionEntity[]>;
  findExpiredActiveSubscriptions(referenceDate: Date): Promise<SubscriptionEntity[]>;
  updateStatusBulk(uuids: Uuid[], newStatus: string): Promise<void>;
  processHireTransaction(
        subscription: SubscriptionEntity,
        userItemToUpsert: AppUserItemEntity,
        transactionRecord: TransactionEntity,
        termAcceptance: TermAcceptanceEntity,
        hubAccountUuid: Uuid,
        priceInCents: number
    ): Promise<void>;
}

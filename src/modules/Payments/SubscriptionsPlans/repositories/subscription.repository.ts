import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { SubscriptionEntity } from "../entities/subscription.entity";

export interface ISubscriptionRepository extends RepositoryInterface<SubscriptionEntity> {
  // Útil para verificar se o usuário já não tem esse plano ativo antes de deixar comprar de novo
  findActiveByUserAndPlan(userUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null>;
  findActiveByBusinessAndPlan(businessUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null>
  upsert(entity: SubscriptionEntity): Promise<void>;
}

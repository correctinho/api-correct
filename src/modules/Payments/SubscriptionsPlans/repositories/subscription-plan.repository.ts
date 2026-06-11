import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { SubscriptionPlanEntity } from "../entities/subscription-plan.entity";

export interface ISubscriptionPlanRepository extends RepositoryInterface<SubscriptionPlanEntity> {
  findActiveByItemAndPayerType(uuid: any, EMPLOYER: any): unknown;
  // Busca apenas os planos ativos (útil para o app/frontend)
  findActivePlansByPayerType(payerType: 'EMPLOYER' | 'USER'): Promise<SubscriptionPlanEntity[]>;
  findByItemUuid(uuid: Uuid): Promise<SubscriptionPlanEntity[]>;
}
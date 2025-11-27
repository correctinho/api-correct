import { PrismaClient, SubscriptionStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { SubscriptionEntity } from "../../entities/subscription.entity";
import { ISubscriptionRepository } from "../subscription.repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class SubscriptionPrismaRepository implements ISubscriptionRepository {
  findActiveByBusinessAndPlan(businessUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null> {
      throw new Error("Method not implemented.");
  }
  update(entity: SubscriptionEntity): Promise<void> {
      throw new Error("Method not implemented.");
  }
  findAll(): Promise<SubscriptionEntity[]> {
      throw new Error("Method not implemented.");
  }
  
  async create(entity: SubscriptionEntity): Promise<void> {
    // Usamos upsert para servir tanto para criar quanto para atualizar
    await prismaClient.subscription.upsert({
        where: { uuid: entity.uuid.uuid },
        update: {
            status: entity.status,
            user_item_uuid: entity.user_item_uuid?.uuid || null,
            end_date: entity.end_date,
            next_billing_date: entity.next_billing_date,
            updated_at: new Date(),
        },
        create: {
            uuid: entity.uuid.uuid,
            subscription_plan_uuid: entity.subscription_plan_uuid.uuid,
            business_info_uuid: entity.business_info_uuid?.uuid || null,
            user_info_uuid: entity.user_info_uuid?.uuid || null,
            employer_item_details_uuid: entity.employer_item_details_uuid?.uuid || null,
            user_item_uuid: entity.user_item_uuid?.uuid || null,
            status: entity.status,
            start_date: entity.start_date,
            end_date: entity.end_date,
            next_billing_date: entity.next_billing_date,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    });
  }

  async find(uuid: Uuid): Promise<SubscriptionEntity | null> {
    const raw = await prismaClient.subscription.findUnique({
        where: { uuid: uuid.uuid }
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findActiveByUserAndPlan(userUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null> {
    const raw = await prismaClient.subscription.findFirst({
        where: {
            user_info_uuid: userUuid.uuid,
            subscription_plan_uuid: planUuid.uuid,
            status: SubscriptionStatus.ACTIVE // Apenas as ativas
        }
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  // Helper privado para hidratar a entidade (Mapper inline)
  private mapToDomain(raw: any): SubscriptionEntity {
      return SubscriptionEntity.hydrate({
        uuid: new Uuid(raw.uuid),
        subscription_plan_uuid: new Uuid(raw.subscription_plan_uuid),
        // Lidando com os nulos do banco
        business_info_uuid: raw.business_info_uuid ? new Uuid(raw.business_info_uuid) : null,
        user_info_uuid: raw.user_info_uuid ? new Uuid(raw.user_info_uuid) : null,
        employer_item_details_uuid: raw.employer_item_details_uuid ? new Uuid(raw.employer_item_details_uuid) : null,
        user_item_uuid: raw.user_item_uuid ? new Uuid(raw.user_item_uuid) : null,
        status: raw.status,
        start_date: raw.start_date,
        end_date: raw.end_date,
        next_billing_date: raw.next_billing_date,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
      });
  }
}
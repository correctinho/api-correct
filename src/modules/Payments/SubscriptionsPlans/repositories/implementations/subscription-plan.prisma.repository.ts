import { PrismaClient, PayerType } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ISubscriptionPlanRepository } from "../subscription-plan.repository";
import { SubscriptionPlanEntity } from "../../entities/subscription-plan.entity";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class SubscriptionPlanPrismaRepository implements ISubscriptionPlanRepository {
  findActiveByItemAndPayerType(uuid: any, EMPLOYER: any): unknown {
    throw new Error("Method not implemented.");
  }
  
   
  async create(entity: SubscriptionPlanEntity): Promise<void> {
    // Conversão Direta: Entidade -> Prisma
    // Usamos rawPriceInCents para garantir que salvamos o inteiro no banco
    await prismaClient.subscriptionPlan.create({
      data: {
        uuid: entity.uuid.uuid,
        item_uuid: entity.item_uuid.uuid,
        name: entity.name,
        description: entity.description,
        price: entity.rawPriceInCents, // <--- PONTO CRÍTICO: Salvando centavos
        currency: entity.currency,
        billing_period: entity.billing_period,
        payer_type: entity.payer_type,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
      },
    });
  }

  async update(entity: SubscriptionPlanEntity): Promise<void> {
    // Conversão Direta: Entidade -> Prisma para atualização
    await prismaClient.subscriptionPlan.update({
      where: { uuid: entity.uuid.uuid },
      data: {
        name: entity.name,
        description: entity.description,
        price: entity.rawPriceInCents, // <--- PONTO CRÍTICO
        currency: entity.currency,
        // billing_period e payer_type geralmente não mudam após a criação,
        // mas se puderem mudar, adicione aqui.
        is_active: entity.is_active,
        updated_at: entity.updated_at,
        // item_uuid, created_at e uuid não são atualizados
      },
    });
  }

  async find(uuid: Uuid): Promise<SubscriptionPlanEntity | null> {
    const rawModel = await prismaClient.subscriptionPlan.findUnique({
      where: { uuid: uuid.uuid },
    });

    if (!rawModel) return null;

    // Conversão Direta Inline: Prisma -> Entidade
    return SubscriptionPlanEntity.hydrate({
      uuid: new Uuid(rawModel.uuid),
      item_uuid: new Uuid(rawModel.item_uuid),
      name: rawModel.name,
      description: rawModel.description,
      price: rawModel.price, // <--- O banco retorna centavos, o hydrate espera centavos. OK.
      currency: rawModel.currency,
      billing_period: rawModel.billing_period,
      payer_type: rawModel.payer_type,
      is_active: rawModel.is_active,
      created_at: rawModel.created_at,
      updated_at: rawModel.updated_at,
    });
  }

  async findAll(): Promise<SubscriptionPlanEntity[]> {
    const rawModels = await prismaClient.subscriptionPlan.findMany();

    // Mapeando os resultados diretamente
    return rawModels.map((rawModel) =>
      SubscriptionPlanEntity.hydrate({
        uuid: new Uuid(rawModel.uuid),
        item_uuid: new Uuid(rawModel.item_uuid),
        name: rawModel.name,
        description: rawModel.description,
        price: rawModel.price, // Centavos
        currency: rawModel.currency,
        billing_period: rawModel.billing_period,
        payer_type: rawModel.payer_type,
        is_active: rawModel.is_active,
        created_at: rawModel.created_at,
        updated_at: rawModel.updated_at,
      })
    );
  }

  async findActivePlansByPayerType(payerType: PayerType): Promise<SubscriptionPlanEntity[]> {
    const rawModels = await prismaClient.subscriptionPlan.findMany({
      where: {
        is_active: true,
        payer_type: payerType,
      },
    });

    // Mapeando os resultados diretamente
    return rawModels.map((rawModel) =>
      SubscriptionPlanEntity.hydrate({
        uuid: new Uuid(rawModel.uuid),
        item_uuid: new Uuid(rawModel.item_uuid),
        name: rawModel.name,
        description: rawModel.description,
        price: rawModel.price, // Centavos
        currency: rawModel.currency,
        billing_period: rawModel.billing_period,
        payer_type: rawModel.payer_type,
        is_active: rawModel.is_active,
        created_at: rawModel.created_at,
        updated_at: rawModel.updated_at,
      })
    );
  }
}
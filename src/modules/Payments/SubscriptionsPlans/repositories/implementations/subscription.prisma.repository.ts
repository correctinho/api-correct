import { PrismaClient, SubscriptionStatus } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { SubscriptionEntity } from "../../entities/subscription.entity";
import { ISubscriptionRepository } from "../subscription.repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { times } from "lodash";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TermAcceptanceEntity } from "../../../../Terms/entities/term-acceptance.entity";
import { TransactionEntity } from "../../../Transactions/entities/transaction-order.entity";

export class SubscriptionPrismaRepository implements ISubscriptionRepository {
    processHireTransaction(subscription: SubscriptionEntity, userItemToUpsert: AppUserItemEntity, transactionRecord: TransactionEntity, termAcceptance: TermAcceptanceEntity, hubAccountUuid: Uuid, priceInCents: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async upsert(entity: SubscriptionEntity): Promise<void> {
        // 1. Obtém os dados formatados da entidade via toJSON()
        const data = entity.toJSON();

        const now = new Date().toISOString();

        // 2. Chamada do Prisma Upsert
        await prismaClient.subscription.upsert({
            where: {
                uuid: data.uuid, // Chave de busca
            },
            create: {
                uuid: data.uuid,
                subscription_plan_uuid: data.subscription_plan_uuid,
                // Chaves estrangeiras opcionais (podem ser null)
                business_info_uuid: data.business_info_uuid,
                user_info_uuid: data.user_info_uuid,
                employer_item_details_uuid: data.employer_item_details_uuid,
                user_item_uuid: data.user_item_uuid,

                status: data.status,

                // Datas importantes
                start_date: data.start_date,
                end_date: data.end_date,
                next_billing_date: data.next_billing_date,

                // Datas de Auditoria
                created_at: data.created_at,
                updated_at: now, // Primeira data de atualização
            },
            // --- SE FOR ATUALIZAR (Mapear tudo, EXCETO uuid e created_at) ---
            update: {
                // Chaves estrangeiras (plan_uuid geralmente não muda, mas os outros podem)
                subscription_plan_uuid: data.subscription_plan_uuid,
                business_info_uuid: data.business_info_uuid,
                user_info_uuid: data.user_info_uuid,
                employer_item_details_uuid: data.employer_item_details_uuid,
                user_item_uuid: data.user_item_uuid,

                status: data.status, // Status muda frequentemente

                // Datas (podem ser recalculadas na ativação)
                start_date: data.start_date,
                end_date: data.end_date,
                next_billing_date: data.next_billing_date,

                // Datas de Auditoria
                // created_at: NÃO ATUALIZAR
                updated_at: now, // Força nova data de atualização
            },
        });
    }
    findActiveByBusinessAndPlan(businessUuid: Uuid, planUuid: Uuid): Promise<SubscriptionEntity | null> {
        throw new Error("Method not implemented.");
    }
    update(entity: SubscriptionEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async findAll(): Promise<SubscriptionEntity[]> {
        const raw = await prismaClient.subscription.findMany();
        return raw.map((sub) => this.mapToDomain(sub));
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
    async findActiveByUser(userUuid: Uuid): Promise<SubscriptionEntity[]> {
        const raw = await prismaClient.subscription.findMany({
            where: {
                user_info_uuid: userUuid.uuid,
                status: SubscriptionStatus.ACTIVE,
            }
        });
        return raw.map((sub) => this.mapToDomain(sub));
    }

    async findExpiredActiveSubscriptions(referenceDate: Date): Promise<SubscriptionEntity[]> {
    // 1. Executa a query no banco via Prisma
    const expiredSubscriptionsModels = await prismaClient.subscription.findMany({
      where: {
        // Condição 1: O status deve ser ATIVO
        status: SubscriptionStatus.ACTIVE,
        
        // Condição 2: A data de término deve existir E ser anterior à data de referência
        end_date: {
          not: null, // Garante que não pegaremos assinaturas sem data de fim definida
          lt: referenceDate, // 'lt' = less than (menor que)
        },
      },
    });

    return expiredSubscriptionsModels.map(this.mapToDomain);
  }

  async updateStatusBulk(uuids: Uuid[], newStatus: string): Promise<void> {
        // 1. Defesa: Se a lista estiver vazia, não faz nada para evitar query inútil no banco.
        if (uuids.length === 0) {
            return;
        }

        // 2. Conversão: Mapeia os Value Objects de domínio (Uuid) para strings primitivas que o Prisma entende.
        const rawUuids = uuids.map(uuidVO => uuidVO.uuid);

        // 3. Execução: Usa o updateMany do Prisma para eficiência.
        // IMPORTANTE: Precisamos fazer o cast do 'newStatus' (string) para o tipo do Enum do Prisma (SubscriptionStatus).
        // Isso é seguro porque a validação do valor correto deve ter ocorrido antes (no domínio ou usecase).
        await prismaClient.subscription.updateMany({
            where: {
                uuid: {
                    in: rawUuids // O segredo está aqui: o operador 'in' pega todos os IDs da lista
                }
            },
            data: {
                status: newStatus as SubscriptionStatus, // Cast para o tipo do enum do banco
                updated_at: new Date() // Sempre atualize a data de modificação
            }
        });

        // O updateMany retorna um objeto { count: number }, mas como a interface retorna void,
        // não precisamos retornar nada.
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
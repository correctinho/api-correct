import { PrismaClient, SubscriptionStatus, UserItemEventType } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { SubscriptionEntity } from "../../entities/subscription.entity";
import { ISubscriptionRepository } from "../subscription.repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { times } from "lodash";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TermAcceptanceEntity } from "../../../../Terms/entities/term-acceptance.entity";
import { TransactionEntity } from "../../../Transactions/entities/transaction-order.entity";
import { newDateF } from "../../../../../utils/date";
import { CustomError } from "../../../../../errors/custom.error";
import { UserItemStatusEnum } from "../../../../AppUser/AppUserManagement/enums/user-item-status.enum";

export class SubscriptionPrismaRepository implements ISubscriptionRepository {
   
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
                updated_at: newDateF(new Date()), // Primeira data de atualização
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
                updated_at: newDateF(new Date()), // Força nova data de atualização
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

//     async executeCheckoutWithBalance(
//         subscriptionEntity: SubscriptionEntity,
//         targetUserItemEntity: AppUserItemEntity,
//         transactionEntity: TransactionEntity,
//         termAcceptanceEntity: TermAcceptanceEntity,
//         hubAccountUuid: Uuid,
//         priceInCents: number
//     ): Promise<void> {
//     // 1. Preparação dos dados (extraindo fora da transação para performance)
//     const subData = subscriptionEntity.toJSON();
//     const itemData = targetUserItemEntity.toJSON();
//     const txData = transactionEntity.toJSON();
//     const termsData = termAcceptanceEntity.toJSON();
//     const now = new Date();

//     console.log(`[CheckoutBalance] Iniciando transação atômica. User: ${subData.user_info_uuid}, Valor: ${priceInCents}`);

//     // 2. Início do Bloco Transacional (usando 'tx' em vez de 'prismaClient')
//     await prismaClient.$transaction(async (tx) => {

//         // A) DÉBITO (Com Trava Otimista: só debita se tiver saldo >= priceInCents)
//         const debitResult = await tx.userItem.updateMany({
//             where: {
//                 uuid: hubAccountUuid.uuid,
//                 balance: { gte: priceInCents }
//             },
//             data: {
//                 balance: { decrement: priceInCents },
//                 updated_at: newDateF(new Date())
//             }
//         });

//         if (debitResult.count === 0) {
//             // Se count for 0, o saldo era insuficiente no momento exato da escrita.
//             throw new CustomError("Falha no débito: Saldo insuficiente no momento da transação.", 409);
//         }
//         console.log('[CheckoutBalance] PASSO A (Débito): Sucesso.');

//         // B) UPSERT DO USER ITEM (O Benefício)
//         await tx.userItem.upsert({
//             where: { uuid: itemData.uuid },
//             create: {
//                 uuid: itemData.uuid,
//                 user_info_uuid: itemData.user_info_uuid,
//                 business_info_uuid: itemData.business_info_uuid,
//                 item_uuid: itemData.item_uuid,
//                 item_name: itemData.item_name,
//                 //item_category: itemData.item_category,
//                 //item_type: itemData.item_type,
//                 balance: itemData.balance,
//                 status: itemData.status as UserItemStatusEnum,
//                 group_uuid: itemData.group_uuid,
//                 //img_url: itemData.img_url,
//                 created_at: itemData.created_at,
//                 updated_at: itemData.updated_at,
//             },
//             update: {
//                 // Reativação: força status para o da entidade (ACTIVE) e limpa bloqueios
//                 status: itemData.status as UserItemStatusEnum,
//                 updated_at: itemData.updated_at,
//                 blocked_at: null, block_reason: null,
//                 cancelled_at: null, cancel_reason: null,
//                 cancelling_request_at: null, grace_period_end_date: null
//             }
//         });
//         console.log('[CheckoutBalance] PASSO B (UserItem Upsert): Sucesso.');

//         // C) CRIAR ASSINATURA (Já Ativa)
//         await tx.subscription.create({
//             data: {
//                 uuid: subData.uuid,
//                 subscription_plan_uuid: subData.subscription_plan_uuid,
//                 user_info_uuid: subData.user_info_uuid,
//                 user_item_uuid: subData.user_item_uuid,
//                 status: subData.status as SubscriptionStatus,
//                 start_date: subData.start_date,
//                 end_date: subData.end_date,
//                 created_at: subData.created_at,
//                 updated_at: subData.updated_at,
//             }
//         });
//         console.log('[CheckoutBalance] PASSO C (Assinatura): Sucesso.');

//         // D) REGISTRAR HISTÓRICO FINANCEIRO (Sucesso)
//         await tx.transactions.create({
//             data: {
//                     uuid: txData.uuid,
//                     // Relacionamentos
//                     user_item_uuid: hubAccountUuid.uuid, // A origem do dinheiro
//                     subscription_uuid: subData.uuid,
                    
//                     // Valores Monetários
//                     original_price: txData.original_price,
//                     discount_percentage: txData.discount_percentage,
//                     net_price: txData.net_price,
                    
//                     // Taxas (opcionais, mas mapeamos se existirem no txData)
//                     fee_percentage: txData.fee_percentage,
//                     fee_amount: txData.fee_amount,
//                     platform_net_fee_amount: txData.platform_net_fee_amount,
//                     cashback: txData.cashback,

//                     // --- CAMPO OBRIGATÓRIO FALTANTE ---
//                     // Em assinaturas B2C, este valor é 0.
//                     partner_credit_amount: txData.partner_credit_amount ?? 0, 
//                     // ----------------------------------

//                     // Metadados
//                     transaction_type: txData.transaction_type,
//                     status: txData.status,
//                     description: txData.description,
                    
//                     // Datas
//                     paid_at: now.toISOString(), // Como é sucesso imediato, a data de pagamento é agora
//                     created_at: txData.created_at,
//                     updated_at: txData.updated_at
//                 }
//         });
//         console.log('[CheckoutBalance] PASSO D (Transação): Sucesso.');

//         // E) REGISTRAR ACEITE DOS TERMOS (Vinculado à transação)
//         await tx.termAcceptance.create({
//             data: {
//                 uuid: termsData.uuid,
//                 app_user_info_uuid: termsData.app_user_info_uuid.uuid,
//                 company_user_uuid: null,
//                 terms_uuid: termsData.terms_uuid.uuid,
//                 transaction_uuid: txData.uuid, // Vínculo crucial
//                 accepted_at: termsData.accepted_at,
//                 ip_address: termsData.ip_address,
//                 user_agent: termsData.user_agent,
//             }
//         });
//         console.log('[CheckoutBalance] PASSO E (Termos): Sucesso.');

//     }); // Fim do bloco da transação

//     console.log('[CheckoutBalance] Transação atômica finalizada com sucesso!');
// }
    async executeCheckoutWithBalance(
        subscriptionEntity: SubscriptionEntity,
        targetUserItemEntity: AppUserItemEntity,
        transactionEntity: TransactionEntity,
        termAcceptanceEntity: TermAcceptanceEntity,
        hubAccountUuid: Uuid,
        priceInCents: number,
        adminUserItemUuid: string
    ): Promise<void> {
        // 1. Preparação dos dados
        const subData = subscriptionEntity.toJSON();
        const itemData = targetUserItemEntity.toJSON();
        const txData = transactionEntity.toJSON();
        const termsData = termAcceptanceEntity.toJSON();
        const now = new Date();
        // 2. Início do Bloco Transacional
        await prismaClient.$transaction(async (tx) => {

            // ==================================================================================
            // PASSO A: DÉBITO COM REGISTRO DE HISTÓRICO
            // ==================================================================================
            
            // A.1. Buscar saldo atual (Leitura com trava implícita pela transação)
            const sourceItem = await tx.userItem.findUnique({
                where: { uuid: hubAccountUuid.uuid }
            });

            if (!sourceItem) {
                throw new CustomError("Conta de origem não encontrada.", 404);
            }

            // A.2. Validação de Saldo (Dupla checagem dentro da tx)
            if (sourceItem.balance < priceInCents) {
                throw new CustomError(`Saldo insuficiente no momento da transação.`, 409);
            }

            const balanceBefore = sourceItem.balance;
            const balanceAfter = sourceItem.balance - priceInCents;

            // A.3. Efetuar o Débito
            await tx.userItem.update({
                where: { uuid: hubAccountUuid.uuid },
                data: {
                    balance: balanceAfter,
                    updated_at: newDateF(now)
                }
            });
            console.log('[CheckoutBalance] PASSO A (Débito): Sucesso.');


            // ==================================================================================
            // PASSO B: UPSERT DO USER ITEM (O Benefício)
            // ==================================================================================
            await tx.userItem.upsert({
                where: { uuid: itemData.uuid },
                create: {
                    uuid: itemData.uuid,
                    user_info_uuid: itemData.user_info_uuid,
                    business_info_uuid: itemData.business_info_uuid,
                    item_uuid: itemData.item_uuid,
                    item_name: itemData.item_name,
                    balance: itemData.balance,
                    status: itemData.status, 
                    group_uuid: itemData.group_uuid,
                    created_at: itemData.created_at,
                    updated_at: itemData.updated_at,
                },
                update: {
                    status: itemData.status,
                    updated_at: itemData.updated_at,
                    blocked_at: null, block_reason: null,
                    cancelled_at: null, cancel_reason: null,
                    cancelling_request_at: null, grace_period_end_date: null
                }
            });
            console.log('[CheckoutBalance] PASSO B (UserItem Upsert): Sucesso.');

            // ==================================================================================
            // PASSO C: CRIAR ASSINATURA
            // ==================================================================================
            await tx.subscription.create({
                data: {
                    uuid: subData.uuid,
                    subscription_plan_uuid: subData.subscription_plan_uuid,
                    user_info_uuid: subData.user_info_uuid,
                    user_item_uuid: subData.user_item_uuid,
                    status: subData.status as any,
                    start_date: subData.start_date,
                    end_date: subData.end_date,
                    created_at: subData.created_at,
                    updated_at: subData.updated_at,
                }
            });
            console.log('[CheckoutBalance] PASSO C (Assinatura): Sucesso.');

            // ==================================================================================
            // PASSO D: REGISTRAR TRANSAÇÃO FINANCEIRA
            // ==================================================================================
            await tx.transactions.create({
                data: {
                    uuid: txData.uuid,
                    user_item_uuid: hubAccountUuid.uuid,
                    subscription_uuid: subData.uuid,
                    original_price: txData.original_price,
                    discount_percentage: txData.discount_percentage,
                    net_price: txData.net_price,
                    fee_percentage: txData.fee_percentage,
                    fee_amount: txData.fee_amount,
                    platform_net_fee_amount: txData.platform_net_fee_amount,
                    cashback: txData.cashback,
                    partner_credit_amount: txData.partner_credit_amount ?? 0,
                    transaction_type: txData.transaction_type,
                    status: txData.status,
                    description: txData.description,
                    paid_at: newDateF(now),
                    created_at: txData.created_at,
                    updated_at: txData.updated_at
                }
            });
            console.log('[CheckoutBalance] PASSO D (Transação): Sucesso.');

            // ==================================================================================
            // PASSO E: CRÉDITO NA CONTA ADMIN (NOVO)
            // ==================================================================================
            // 1. Buscar conta Admin
            const adminItem = await tx.correctAccount.findUnique({
                where: { uuid: adminUserItemUuid}
            });

            if (!adminItem) {
                throw new CustomError("Conta da Administradora (Correct) não encontrada para crédito.", 500);
            }

            const adminBalanceBefore = adminItem.balance;
            const adminBalanceAfter = adminBalanceBefore + priceInCents; // Soma

            // 2. Atualizar saldo Admin
            await tx.correctAccount.update({
                where: { uuid: adminUserItemUuid },
                data: {
                    balance: adminBalanceAfter,
                    updated_at: newDateF(now)
                }
            });

            // 3. Histórico Admin (Entrada de Receita)
            await tx.correctAccountHistory.create({
                data: {
                    correct_account_uuid: adminUserItemUuid,
                    event_type: "SUBSCRIPTION_REVENUE",
                    amount: priceInCents,
                    balance_before: adminBalanceBefore,
                    balance_after: adminBalanceAfter,
                    related_transaction_uuid: txData.uuid,
                    created_at: now
                }
            });
            console.log('[CheckoutBalance] PASSO E (Crédito Admin): Sucesso.');

            // ==================================================================================
            // PASSO F: HISTÓRICO USUÁRIO (Extrato)
            // ==================================================================================
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: hubAccountUuid.uuid,
                    event_type: UserItemEventType.ITEM_SPENT, // Gasto de saldo
                    amount: -priceInCents, // Valor negativo pois é saída
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    related_transaction_uuid: txData.uuid, // Vínculo com a transação
                    created_at: now
                }
            });
            console.log('[CheckoutBalance] PASSO A.4 (Histórico/Extrato): Sucesso.');

            // ==================================================================================
            // PASSO G: REGISTRAR ACEITE DOS TERMOS
            // ==================================================================================
            await tx.termAcceptance.create({
                data: {
                    uuid: termsData.uuid,
                    app_user_info_uuid: termsData.app_user_info_uuid.uuid, // Ajuste conforme seu DTO
                    terms_uuid: termsData.terms_uuid.uuid, // Ajuste conforme seu DTO
                    transaction_uuid: txData.uuid,
                    accepted_at: termsData.accepted_at,
                    ip_address: termsData.ip_address,
                    user_agent: termsData.user_agent,
                }
            });
            console.log('[CheckoutBalance] PASSO E (Termos): Sucesso.');

        }); // Fim do transaction

        console.log('[CheckoutBalance] Transação atômica finalizada com sucesso!');
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
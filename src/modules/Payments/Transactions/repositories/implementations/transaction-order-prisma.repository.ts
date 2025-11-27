import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import {
    TransactionEntity,
    TransactionProps,
} from '../../entities/transaction-order.entity';
import {
    ITransactionOrderRepository,
    ProcessAppUserPixCreditPaymentResult,
    ProcessPaymentByBusinessParams,
    ProcessPaymentByBusinessResult,
} from '../transaction-order.repository';
import {
    BusinessAccountEventType,
    CorrectAccountEventType,
    OfflineTokenHistoryEventType,
    OfflineTokenStatus,
    TransactionStatus,
    TransactionType,
    UserItemEventType,
} from '@prisma/client';
import { CalculateSplitPrePaidOutput } from '../../../../../paymentSplit/prePaidSplit';
import { CustomError } from '../../../../../errors/custom.error';
import {
    calculateCycleSettlementDateAsDate,
    newDateF,
} from '../../../../../utils/date';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { OfflineTokenEntity } from '../../../OfflineTokens/entities/offline-token.entity';

export class TransactionOrderPrismaRepository
    implements ITransactionOrderRepository
{
    async upsert(entity: TransactionEntity): Promise<void> {
        // 1. Obtém os dados formatados da entidade via toJSON()
        const data = entity.toJSON();

        const now = new Date().toISOString();

        // 2. Chamada do Prisma Upsert
        await prismaClient.transactions.upsert({
            where: {
                uuid: data.uuid, // Chave de busca obtida do JSON
            },
            create: {
                uuid: data.uuid,
                // Chaves Estrangeiras
                subscription_uuid: data.subscription_uuid,
                user_item_uuid: data.user_item_uuid,
                favored_user_uuid: data.favored_user_uuid,
                favored_business_info_uuid: data.favored_business_info_uuid,
                payer_business_info_uuid: data.payer_business_info_uuid,
                favored_partner_user_uuid: data.favored_partner_user_uuid,

                // Valores Monetários e Porcentagens (Já formatados no JSON)
                original_price: data.original_price,
                net_price: data.net_price,
                fee_percentage: data.fee_percentage ?? 0,
                fee_amount: data.fee_amount ?? 0,
                platform_net_fee_amount: data.platform_net_fee_amount ?? 0,
                partner_credit_amount: data.partner_credit_amount,
                cashback: data.cashback,
                discount_percentage: data.discount_percentage,

                // Campos Padrão
                description: data.description,
                status: data.status,
                transaction_type: data.transaction_type,
                provider_tx_id: data.provider_tx_id,
                pix_e2e_id: data.pix_e2e_id,
                used_offline_token_code: data.used_offline_token_code,

                // Datas
                paid_at: data.paid_at,
                created_at: data.created_at, // Usa a data do JSON da entidade
                updated_at: now, // Define a primeira data de atualização
            },
            // --- SE FOR ATUALIZAR (Mapear tudo do JSON, EXCETO uuid e created_at) ---
            update: {
                // Chaves Estrangeiras
                subscription_uuid: data.subscription_uuid,
                user_item_uuid: data.user_item_uuid,
                favored_user_uuid: data.favored_user_uuid,
                favored_business_info_uuid: data.favored_business_info_uuid,
                payer_business_info_uuid: data.payer_business_info_uuid,
                favored_partner_user_uuid: data.favored_partner_user_uuid,

                // Valores
                original_price: data.original_price,
                net_price: data.net_price,
                fee_percentage: data.fee_percentage ?? 0,
                fee_amount: data.fee_amount ?? 0,
                platform_net_fee_amount: data.platform_net_fee_amount ?? 0,
                partner_credit_amount: data.partner_credit_amount,
                cashback: data.cashback,
                discount_percentage: data.discount_percentage,

                // Campos Padrão
                description: data.description,
                status: data.status,
                transaction_type: data.transaction_type,
                provider_tx_id: data.provider_tx_id,
                pix_e2e_id: data.pix_e2e_id,
                used_offline_token_code: data.used_offline_token_code,

                // Datas
                paid_at: data.paid_at,
                // created_at: NÃO ATUALIZAR
                updated_at: now, // Força nova data de atualização
            },
        });
    }
    async saveSubscriptionPaymentTransaction(
        entity: TransactionEntity
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async processOfflineTokenPayment(
        transactionEntity: TransactionEntity,
        offlineTokenEntity: OfflineTokenEntity,
        userInfoUuid: Uuid
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }> {
        const dataToSave = transactionEntity.toJSON();
        const debitedUserItemId = dataToSave.user_item_uuid; // UUID do benefício que está sendo debitado
        const transactionId = dataToSave.uuid;
        const favoredBusinessInfoId = dataToSave.favored_business_info_uuid;
        const totalAmountToDecrement = dataToSave.net_price; // Valor total gasto pelo usuário
        const netAmountToCreditBusiness = dataToSave.partner_credit_amount;
        const netAmountToCreditPlatform = dataToSave.platform_net_fee_amount;
        const cashbackAmountToCreditUser = dataToSave.cashback; // Valor do cashback a ser creditado
        // Dados do OfflineToken que serão atualizados/usados
        const offlineTokenUuid = offlineTokenEntity.uuid.uuid;
        const offlineTokenCode = offlineTokenEntity.token_code;

        const result = await prismaClient.$transaction(async (tx) => {
            // 0. CRIAR A TRANSAÇÃO NO BANCO DE DADOS PRIMEIRO!
            //    Isso garante que o 'transactionId' (UUID da transação) exista no DB antes de ser referenciado.
            await tx.transactions.create({
                data: {
                    uuid: dataToSave.uuid, // O UUID da sua entidade dataToSave
                    user_item_uuid: debitedUserItemId, // O item que foi debitado
                    favored_business_info_uuid: favoredBusinessInfoId, // O negócio que recebeu o pagamento
                    original_price: dataToSave.original_price,
                    discount_percentage: dataToSave.discount_percentage,
                    net_price: dataToSave.net_price,
                    fee_percentage: dataToSave.fee_percentage,
                    fee_amount: dataToSave.fee_amount,
                    partner_credit_amount: dataToSave.partner_credit_amount,
                    platform_net_fee_amount: dataToSave.platform_net_fee_amount,
                    cashback: dataToSave.cashback,
                    description: dataToSave.description,
                    status: dataToSave.status, // Inicialmente 'pending', será atualizado para 'success' depois
                    transaction_type: dataToSave.transaction_type,
                    used_offline_token_code: dataToSave.used_offline_token_code, // Código do token offline usado
                    created_at: newDateF(new Date()),
                },
            });
            // 1. Buscar UserItem DEBITADO e verificar saldo atomicamente
            const debitedUserItem = await tx.userItem.findUnique({
                where: { uuid: debitedUserItemId },
                select: { balance: true, user_info_uuid: true },
            });
            if (!debitedUserItem) {
                throw new CustomError(
                    `Debited UserItem with UUID ${debitedUserItemId} not found.`,
                    404
                );
            }
            if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) {
                throw new CustomError(
                    `Debited UserItem ${debitedUserItemId} does not belong to user ${userInfoUuid.uuid}.`,
                    409
                );
            }
            if (debitedUserItem.balance < totalAmountToDecrement) {
                throw new CustomError(
                    `Insufficient balance in UserItem ${debitedUserItemId}. Required: ${totalAmountToDecrement}, Available: ${debitedUserItem.balance}`,
                    403
                );
            }
            const debitedUserItemBalanceBefore = debitedUserItem.balance;
            const debitedUserItemBalanceAfter =
                debitedUserItemBalanceBefore - totalAmountToDecrement;

            // 2. Buscar UserItem "Correct" para o cashback
            const correctUserItem = await tx.userItem.findFirst({
                where: {
                    user_info_uuid: userInfoUuid.uuid,
                    item_name: 'Correct',
                },
                select: { uuid: true, balance: true },
            });
            if (!correctUserItem) {
                throw new CustomError(
                    `User ${userInfoUuid.uuid} does not have a 'Correct' UserItem to receive cashback.`,
                    404
                );
            }
            const correctUserItemId = correctUserItem.uuid;
            const correctItemBalanceBeforeCashback = correctUserItem.balance;
            const correctItemBalanceAfterCashback =
                correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

            // 3. Buscar BusinessAccount do Parceiro
            const currentBusinessAccount = await tx.businessAccount.findFirst({
                where: { business_info_uuid: favoredBusinessInfoId },
                select: { uuid: true, balance: true },
            });
            if (!currentBusinessAccount) {
                throw new CustomError(
                    `BusinessAccount associated with BusinessInfo ${favoredBusinessInfoId} not found.`,
                    404
                );
            }
            const businessAccountId = currentBusinessAccount.uuid;
            const businessBalanceBefore = currentBusinessAccount.balance;
            const businessBalanceAfter =
                businessBalanceBefore + netAmountToCreditBusiness;

            // 4. Buscar CorrectAccount da Plataforma
            const currentCorrectAccount = await tx.correctAccount.findFirst({
                select: { uuid: true, balance: true },
            });
            if (!currentCorrectAccount) {
                throw new CustomError(
                    `CorrectAccount not found. System configuration error.`,
                    500
                );
            }
            const correctAccountId = currentCorrectAccount.uuid;
            const correctBalanceBefore = currentCorrectAccount.balance;
            const correctBalanceAfter =
                correctBalanceBefore + netAmountToCreditPlatform;

            // --- Executar Atualizações ---

            // 5. Debitar UserItem DEBITADO
            await tx.userItem.update({
                where: { uuid: debitedUserItemId },
                data: {
                    balance: { decrement: totalAmountToDecrement },
                    updated_at: newDateF(new Date()),
                },
            });

            // 6. Creditar BusinessAccount do Parceiro
            await tx.businessAccount.update({
                where: { uuid: businessAccountId },
                data: {
                    balance: { increment: netAmountToCreditBusiness },
                    updated_at: newDateF(new Date()),
                },
            });

            // 7. Creditar CorrectAccount da Plataforma
            await tx.correctAccount.update({
                where: { uuid: correctAccountId },
                data: {
                    balance: { increment: netAmountToCreditPlatform },
                    updated_at: newDateF(new Date()),
                },
            });

            // 8. Creditar CASHBACK no UserItem "Correct" do Usuário
            await tx.userItem.update({
                where: { uuid: correctUserItemId },
                data: {
                    balance: { increment: cashbackAmountToCreditUser },
                    updated_at: newDateF(new Date()),
                },
            });

            // NOVO: 9. Atualizar o OfflineToken para CONSUMED e last_used_at/last_accessed_at
            await tx.offlineToken.update({
                where: { uuid: offlineTokenUuid },
                data: {
                    status: OfflineTokenStatus.CONSUMED,
                    last_used_at: new Date(),
                    last_accessed_at: new Date(),
                    updated_at: new Date(),
                },
            });
            // NOVO: 10. Criar registro no OfflineTokenHistory
            await tx.offlineTokenHistory.create({
                data: {
                    original_token_uuid: offlineTokenUuid,
                    token_code: offlineTokenCode,
                    user_info_uuid: userInfoUuid.uuid,
                    user_item_uuid: debitedUserItemId, // O UserItem associado ao uso do token
                    event_type:
                        OfflineTokenHistoryEventType.USED_IN_TRANSACTION, // Ou CONSUMED, dependendo da sua preferência
                    event_description: `Token used for transaction ${transactionId}.`,
                    related_transaction_uuid: transactionId,
                    event_at: new Date(),
                    snapshot_expires_at: offlineTokenEntity.expires_at, // Captura o estado no momento
                    snapshot_status: OfflineTokenStatus.CONSUMED, // O status APÓS o uso
                },
            });

            // --- Criação dos Registros de Histórico das Contas ---

            // 11. Histórico GASTO UserItem DEBITADO
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: debitedUserItemId,
                    event_type: 'ITEM_SPENT', // Substitua pelo seu enum UserItemEventType.ITEM_SPENT
                    amount: -totalAmountToDecrement,
                    balance_before: debitedUserItemBalanceBefore,
                    balance_after: debitedUserItemBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 12. Histórico CASHBACK UserItem "Correct"
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: correctUserItemId,
                    event_type: 'CASHBACK_RECEIVED', // Substitua pelo seu enum UserItemEventType.CASHBACK_RECEIVED
                    amount: cashbackAmountToCreditUser,
                    balance_before: correctItemBalanceBeforeCashback,
                    balance_after: correctItemBalanceAfterCashback,
                    related_transaction_uuid: transactionId,
                },
            });
            // 13. Histórico BusinessAccount do Parceiro
            await tx.businessAccountHistory.create({
                data: {
                    business_account_uuid: businessAccountId,
                    event_type: 'PAYMENT_RECEIVED', // Substitua pelo seu enum BusinessAccountEventType.PAYMENT_RECEIVED
                    amount: netAmountToCreditBusiness,
                    balance_before: businessBalanceBefore,
                    balance_after: businessBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 14. Histórico CorrectAccount da Plataforma
            await tx.correctAccountHistory.create({
                data: {
                    correct_account_uuid: correctAccountId,
                    event_type: 'PLATFORM_FEE_COLLECTED', // Substitua pelo seu enum CorrectAccountEventType.PLATFORM_FEE_COLLECTED
                    amount: netAmountToCreditPlatform,
                    balance_before: correctBalanceBefore,
                    balance_after: correctBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 15. Atualizar Status da Transação Original para "success"
            await tx.transactions.update({
                where: { uuid: transactionId },
                data: {
                    status: 'success', // Seu TransactionStatus.SUCCESS
                    user_item_uuid: debitedUserItemId,
                    paid_at: newDateF(new Date()),
                    updated_at: newDateF(new Date()),
                },
            });
            // 16. Retorno
            return {
                success: true,
                finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
                user_cashback_amount: cashbackAmountToCreditUser,
            };
        });

        return result;
    }

    async processAppUserPixCreditPayment(
        transactionEntity: TransactionEntity, // <--- Recebe a TransactionEntity
        amountReceivedInCents: number
    ): Promise<ProcessAppUserPixCreditPaymentResult> {
        const transactionUuidString = transactionEntity.uuid.uuid;
        // Re-buscar a transação para garantir que estamos trabalhando com os dados mais recentes
        // ou se quiser otimizar, pode assumir que a transactionEntity está atualizada
        // e apenas usar seu `uuid` para o `update` no final.
        // Para maior segurança, vamos buscar novamente.
        const result = await prismaClient.$transaction(async (tx) => {
            const dbTransaction = await tx.transactions.findUnique({
                where: { uuid: transactionUuidString },
                select: {
                    uuid: true,
                    user_item_uuid: true,
                    net_price: true,
                    status: true,
                },
            });

            if (!dbTransaction) {
                // Caso a transação tenha sido deletada entre a busca no usecase e aqui
                throw new CustomError(
                    `Transaction with UUID ${transactionUuidString} not found during PIX credit processing.`,
                    404
                );
            }
            if (dbTransaction.status !== TransactionStatus.pending) {
                throw new CustomError(
                    `Transaction ${transactionUuidString} is not in 'pending' status (${dbTransaction.status}). Cannot process AppUser PIX credit.`,
                    409
                );
            }

            if (dbTransaction.net_price !== amountReceivedInCents) {
                throw new CustomError(
                    `Mismatched amount for transaction ${transactionUuidString}. Expected: ${dbTransaction.net_price}, Received: ${amountReceivedInCents}.`,
                    409
                );
            }

            const creditedUserItemUuid = dbTransaction.user_item_uuid; // Use o da transação do DB
            if (!creditedUserItemUuid) {
                throw new CustomError(
                    `Transaction ${transactionUuidString} does not have a user_item_uuid for credit.`,
                    500
                );
            }

            const creditedUserItem = await tx.userItem.findUnique({
                where: { uuid: creditedUserItemUuid },
                select: { uuid: true, balance: true },
            });

            if (!creditedUserItem) {
                throw new CustomError(
                    `Credited AppUser UserItem with UUID ${creditedUserItemUuid} not found for transaction ${transactionUuidString}.`,
                    404
                );
            }

            const creditedItemBalanceBefore = creditedUserItem.balance;
            const creditedItemBalanceAfter =
                creditedItemBalanceBefore + amountReceivedInCents;

            // --- Executar Atualizações Atômicas ---
            // 1. Creditar o saldo no UserItem do AppUser
            await tx.userItem.update({
                where: { uuid: creditedUserItemUuid },
                data: {
                    balance: { increment: amountReceivedInCents },
                    updated_at: newDateF(new Date()),
                },
            });
            // 2. Registrar no Histórico do UserItem do AppUser
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: creditedUserItemUuid,
                    event_type: UserItemEventType.PIX_RECEIVED,
                    amount: amountReceivedInCents,
                    balance_before: creditedItemBalanceBefore,
                    balance_after: creditedItemBalanceAfter,
                    related_transaction_uuid: transactionUuidString,
                },
            });

            // 3. Atualizar a Transação com os dados da entidade
            await tx.transactions.update({
                where: { uuid: transactionUuidString },
                data: {
                    status: transactionEntity.status, // Usa o status já definido na entidade (success)
                    paid_at: transactionEntity.paid_at, // Usa a data definida na entidade (string)
                    pix_e2e_id: transactionEntity.pix_e2e_id, // Usa o endToEndId definido na entidade
                    updated_at: transactionEntity.updated_at, // Usa o updated_at definido na entidade
                    // Não alteramos provider_tx_id aqui, ele deve ter sido definido na criação da cobrança
                },
            });
            return {
                success: true,
                finalCreditedUserItemBalance: creditedItemBalanceAfter,
            };
        });
        return result;
    }

    async findByProviderTxId(
        providerTxId: string
    ): Promise<TransactionEntity | null> {
        const transactionPix = await prismaClient.transactions.findFirst({
            where: {
                provider_tx_id: providerTxId,
            },
        });

        if (!transactionPix) {
            return null;
        }

        const transactionProps: TransactionProps = {
            uuid: new Uuid(transactionPix.uuid),
            user_item_uuid: transactionPix.user_item_uuid
                ? new Uuid(transactionPix.user_item_uuid)
                : null,
            favored_user_uuid: transactionPix.favored_user_uuid
                ? new Uuid(transactionPix.favored_user_uuid)
                : null,
            favored_business_info_uuid:
                transactionPix.favored_business_info_uuid
                    ? new Uuid(transactionPix.favored_business_info_uuid)
                    : null,
            original_price: transactionPix.original_price,
            discount_percentage: transactionPix.discount_percentage,
            net_price: transactionPix.net_price,
            fee_percentage: transactionPix.fee_percentage,
            fee_amount: transactionPix.fee_amount,
            partner_credit_amount: transactionPix.partner_credit_amount,
            cashback: transactionPix.cashback,
            description: transactionPix.description,
            status: transactionPix.status,
            transaction_type: transactionPix.transaction_type,
            favored_partner_user_uuid: transactionPix.favored_partner_user_uuid
                ? new Uuid(transactionPix.favored_partner_user_uuid)
                : null,
            paid_at: transactionPix.paid_at,
            provider_tx_id: transactionPix.provider_tx_id,
            pix_e2e_id: transactionPix.pix_e2e_id,
            subscription_uuid: transactionPix.subscription_uuid ? new Uuid(transactionPix.subscription_uuid) : null,
            created_at: transactionPix.created_at,
            updated_at: transactionPix.updated_at,
        };

        // 3. Usa o método estático 'hydrate' para reconstruir a entidade completa.
        //    Isso garante que o objeto retornado seja uma instância de classe real.
        return TransactionEntity.hydrate(transactionProps);
    }
    async createPendingCashIn(
        userId: Uuid,
        userItem: Uuid,
        amountInCents: number
    ): Promise<TransactionEntity> {
        const transactionData = await prismaClient.transactions.create({
            data: {
                // Geramos um novo UUID para a nossa transação
                uuid: new Uuid().uuid,
                favored_user_uuid: userId.uuid,
                user_item_uuid: userItem.uuid,
                original_price: amountInCents,
                net_price: amountInCents,
                partner_credit_amount: 0, // Não se aplica a cash-in
                status: TransactionStatus.pending,
                transaction_type: TransactionType.CASH_IN_PIX_USER,
                created_at: newDateF(new Date()),
            },
        });

        // Hidratamos o resultado para retornar a entidade completa, como nos outros métodos
        const transactionProps: TransactionProps = {
            uuid: new Uuid(transactionData.uuid),
            user_item_uuid: transactionData.user_item_uuid
                ? new Uuid(transactionData.user_item_uuid)
                : null,
            favored_user_uuid: transactionData.favored_user_uuid
                ? new Uuid(transactionData.favored_user_uuid)
                : null,
            favored_business_info_uuid:
                transactionData.favored_business_info_uuid
                    ? new Uuid(transactionData.favored_business_info_uuid)
                    : null,
            original_price: transactionData.original_price,
            discount_percentage: transactionData.discount_percentage,
            net_price: transactionData.net_price,
            fee_percentage: transactionData.fee_percentage,
            fee_amount: transactionData.fee_amount,
            partner_credit_amount: transactionData.partner_credit_amount,
            cashback: transactionData.cashback,
            description: transactionData.description,
            status: transactionData.status,
            transaction_type: transactionData.transaction_type,
            favored_partner_user_uuid: transactionData.favored_partner_user_uuid
                ? new Uuid(transactionData.favored_partner_user_uuid)
                : null,
            paid_at: transactionData.paid_at,
            created_at: transactionData.created_at,
            updated_at: transactionData.updated_at,
        };

        return TransactionEntity.hydrate(transactionProps);
    }

    async updateTxId(transactionId: Uuid, txid: string): Promise<void> {
        await prismaClient.transactions.update({
            where: {
                uuid: transactionId.uuid,
            },
            data: {
                provider_tx_id: txid,
                updated_at: newDateF(new Date()),
            },
        });
    }
    async generateTransactionReceiptDetails(
        transactionId: string
    ): Promise<any> {
        const transaction = await prismaClient.transactions.findUnique({
            where: {
                uuid: transactionId,
            },
            include: {
                UserInfo: {
                    select: {
                        full_name: true,
                    },
                },
                BusinessInfo: {
                    select: {
                        fantasy_name: true,
                    },
                },
            },
        });

        if (!transaction) return null;

        return {
            uuid: new Uuid(transaction.uuid),
            user_item_uuid: transaction.user_item_uuid
                ? new Uuid(transaction.user_item_uuid)
                : null,
            favored_user_uuid: transaction.favored_user_uuid
                ? new Uuid(transaction.favored_user_uuid)
                : null,
            favored_business_info_uuid: transaction.favored_business_info_uuid
                ? new Uuid(transaction.favored_business_info_uuid)
                : null,
            original_price: transaction.original_price,
            fee_amount: transaction.fee_amount,
            cashback: transaction.cashback,
            description: transaction.description,
            status: transaction.status,
            transaction_type: transaction.transaction_type,
            created_at: transaction.created_at,
            updated_at: transaction.updated_at,
        } as TransactionEntity;
    }
    async findBusinessAccountByBusinessInfoId(id: string): Promise<any> {
        const businessAccount = await prismaClient.businessAccount.findFirst({
            where: {
                business_info_uuid: id,
            },
        });

        return businessAccount;
    }

    async findCorrectAccount(): Promise<any> {
        const correctAccount = await prismaClient.correctAccount.findFirst();
        return correctAccount;
    }

    async processSplitPrePaidPayment(
        transactionEntity: TransactionEntity,
        splitOutput: CalculateSplitPrePaidOutput,
        userInfoUuid: Uuid
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }> {
        // Extrair IDs e valores necessários para clareza
        const debitedUserItemId = transactionEntity.user_item_uuid?.uuid; // UUID do benefício que está sendo debitado
        const transactionId = transactionEntity.uuid.uuid;

        const favoredBusinessInfoId =
            transactionEntity.favored_business_info_uuid?.uuid;
        const totalAmountToDecrement = transactionEntity.net_price; // Valor total gasto pelo usuário
        const netAmountToCreditBusiness = splitOutput.partnerNetAmount;
        const netAmountToCreditPlatform = splitOutput.platformNetAmount;
        const cashbackAmountToCreditUser = splitOutput.userCashbackAmount; // Valor do cashback a ser creditado

        const result = await prismaClient.$transaction(async (tx) => {
            // 1. Buscar UserItem DEBITADO e verificar saldo atomicamente
            const debitedUserItem = await tx.userItem.findUnique({
                where: { uuid: debitedUserItemId },
                select: { balance: true, user_info_uuid: true }, // Buscar saldo e ID do usuário
            });
            if (!debitedUserItem) {
                throw new CustomError(
                    `Debited UserItem with UUID ${debitedUserItemId} not found.`,
                    404
                );
            }
            // Verificar se o item pertence ao usuário correto (segurança adicional)
            if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) {
                throw new CustomError(
                    `Debited UserItem ${debitedUserItemId} does not belong to user ${userInfoUuid}.`,
                    409
                );
            }

            // Verificação atômica do saldo
            if (debitedUserItem.balance < totalAmountToDecrement) {
                throw new CustomError(
                    `Insufficient balance in UserItem ${debitedUserItemId}. Required: ${totalAmountToDecrement}, Available: ${debitedUserItem.balance}`,
                    403
                );
            }
            const debitedUserItemBalanceBefore = debitedUserItem.balance;
            const debitedUserItemBalanceAfter =
                debitedUserItemBalanceBefore - totalAmountToDecrement;

            // 2. Buscar UserItem "Correct" para o cashback
            const correctUserItem = await tx.userItem.findFirst({
                where: {
                    user_info_uuid: userInfoUuid.uuid, // Do mesmo usuário
                    item_name: 'Correct', // Com o nome "Correct"
                },
                select: { uuid: true, balance: true },
            });

            if (!correctUserItem) {
                // Importante: O usuário PRECISA ter um item "Correct" para receber cashback
                throw new CustomError(
                    `User ${userInfoUuid.uuid} does not have a 'Correct' UserItem to receive cashback.`,
                    404
                );
            }
            const correctUserItemId = correctUserItem.uuid;
            const correctItemBalanceBeforeCashback = correctUserItem.balance;
            const correctItemBalanceAfterCashback =
                correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

            // 3. Buscar saldo atual da BusinessAccount
            const currentBusinessAccount = await tx.businessAccount.findFirst({
                // Usar findFirst pois a relação pode não ser unique no schema (embora devesse ser)
                where: { business_info_uuid: favoredBusinessInfoId }, // Busca pelo ID do BusinessInfo
                select: { uuid: true, balance: true }, // Seleciona o UUID e o saldo
            });
            if (!currentBusinessAccount) {
                // Se a conta da empresa DEVE existir para a transação, lançar erro
                throw new CustomError(
                    `BusinessAccount associated with BusinessInfo ${favoredBusinessInfoId} not found.`,
                    404
                );
            }
            const businessAccountId = currentBusinessAccount.uuid; // <<< Pega o UUID aqui
            const businessBalanceBefore = currentBusinessAccount.balance;
            const businessBalanceAfter =
                businessBalanceBefore + netAmountToCreditBusiness;

            // 4. Buscar CorrectAccount (assumindo que só existe uma)
            const currentCorrectAccount = await tx.correctAccount.findFirst({
                // findFirst pois não há ID único óbvio para buscar
                select: { uuid: true, balance: true }, // Seleciona o UUID e o saldo
            });
            if (!currentCorrectAccount) {
                // A conta da plataforma DEVE existir
                throw new CustomError(
                    `CorrectAccount not found. System configuration error.`,
                    500
                );
            }
            const correctAccountId = currentCorrectAccount.uuid; // <<< Pega o UUID aqui
            const correctBalanceBefore = currentCorrectAccount.balance;
            const correctBalanceAfter =
                correctBalanceBefore + netAmountToCreditPlatform;

            // --- Executar Atualizações ---

            // 5. Debitar UserItem DEBITADO
            await tx.userItem.update({
                where: { uuid: debitedUserItemId },
                data: {
                    balance: { decrement: totalAmountToDecrement },
                    updated_at: transactionEntity.updated_at,
                },
            });

            // 6. Creditar BusinessAccount
            await tx.businessAccount.update({
                where: { uuid: businessAccountId }, // Usa o ID buscado
                data: {
                    balance: { increment: netAmountToCreditBusiness },
                    updated_at: transactionEntity.updated_at,
                },
            });

            // 7. Creditar CorrectAccount
            await tx.correctAccount.update({
                where: { uuid: correctAccountId }, // Usa o ID buscado
                data: {
                    balance: { increment: netAmountToCreditPlatform },
                    updated_at: transactionEntity.updated_at,
                },
            });
            // 8. Creditar CASHBACK no UserItem "Correct"
            await tx.userItem.update({
                where: { uuid: correctUserItemId },
                data: {
                    balance: { increment: cashbackAmountToCreditUser },
                    updated_at: transactionEntity.updated_at,
                },
            });
            // 9. Histórico GASTO UserItem DEBITADO
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: debitedUserItemId,
                    event_type: UserItemEventType.ITEM_SPENT,
                    amount: -totalAmountToDecrement,
                    balance_before: debitedUserItemBalanceBefore,
                    balance_after: debitedUserItemBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 10. Histórico CASHBACK UserItem "Correct"
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: correctUserItemId,
                    event_type: UserItemEventType.CASHBACK_RECEIVED,
                    amount: cashbackAmountToCreditUser,
                    balance_before: correctItemBalanceBeforeCashback,
                    balance_after: correctItemBalanceAfterCashback,
                    related_transaction_uuid: transactionId,
                },
            });

            // 11. Histórico BusinessAccount
            await tx.businessAccountHistory.create({
                data: {
                    business_account_uuid: businessAccountId, // Usa o ID buscado
                    event_type: BusinessAccountEventType.PAYMENT_RECEIVED,
                    amount: netAmountToCreditBusiness,
                    balance_before: businessBalanceBefore,
                    balance_after: businessBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 12. Histórico CorrectAccount
            await tx.correctAccountHistory.create({
                data: {
                    correct_account_uuid: correctAccountId, // Usa o ID buscado
                    event_type: CorrectAccountEventType.PLATFORM_FEE_COLLECTED,
                    amount: netAmountToCreditPlatform,
                    balance_before: correctBalanceBefore,
                    balance_after: correctBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 13. Atualizar Status da Transação Original
            await tx.transactions.update({
                where: { uuid: transactionId },
                data: {
                    status: 'success',
                    cashback: cashbackAmountToCreditUser,
                    fee_amount: splitOutput.platformGrossAmount,
                    user_item_uuid: debitedUserItemId,
                    favored_business_info_uuid: favoredBusinessInfoId,
                    updated_at: transactionEntity.updated_at,
                },
            });

            // Retornar sucesso e o saldo final do item DEBITADO
            return {
                success: true,
                finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
                user_cashback_amount: cashbackAmountToCreditUser,
            };
        }); // Fim do $transaction

        return {
            success: result.success,
            finalDebitedUserItemBalance: result.finalDebitedUserItemBalance,
            user_cashback_amount: cashbackAmountToCreditUser,
        }; // Retorna o resultado da transação
    }
    async processSplitPrePaidPaymentTest(
        transactionEntity: TransactionEntity,
        userInfoUuid: Uuid
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }> {
        const dataToSave = transactionEntity.toJSON();
        // Extrair IDs e valores necessários para clareza
        const debitedUserItemId = dataToSave.user_item_uuid; // UUID do benefício que está sendo debitado
        const transactionId = dataToSave.uuid;

        const favoredBusinessInfoId = dataToSave.favored_business_info_uuid;
        const totalAmountToDecrement = dataToSave.net_price; // Valor total gasto pelo usuário
        const netAmountToCreditBusiness = dataToSave.partner_credit_amount;
        const netAmountToCreditPlatform = dataToSave.platform_net_fee_amount;
        const cashbackAmountToCreditUser = dataToSave.cashback; // Valor do cashback a ser creditado
        const result = await prismaClient.$transaction(async (tx) => {
            // 1. Buscar UserItem DEBITADO e verificar saldo atomicamente
            const debitedUserItem = await tx.userItem.findUnique({
                where: { uuid: debitedUserItemId },
                select: { balance: true, user_info_uuid: true }, // Buscar saldo e ID do usuário
            });
            if (!debitedUserItem) {
                throw new CustomError(
                    `Debited UserItem with UUID ${debitedUserItemId} not found.`,
                    404
                );
            }
            // Verificar se o item pertence ao usuário correto (segurança adicional)
            if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) {
                throw new CustomError(
                    `Debited UserItem ${debitedUserItemId} does not belong to user ${userInfoUuid}.`,
                    409
                );
            }

            // Verificação atômica do saldo
            if (debitedUserItem.balance < totalAmountToDecrement) {
                throw new CustomError(
                    `Insufficient balance in UserItem ${debitedUserItemId}. Required: ${totalAmountToDecrement}, Available: ${debitedUserItem.balance}`,
                    403
                );
            }
            const debitedUserItemBalanceBefore = debitedUserItem.balance;
            const debitedUserItemBalanceAfter =
                debitedUserItemBalanceBefore - totalAmountToDecrement;

            // 2. Buscar UserItem "Correct" para o cashback
            const correctUserItem = await tx.userItem.findFirst({
                where: {
                    user_info_uuid: userInfoUuid.uuid, // Do mesmo usuário
                    item_name: 'Correct', // Com o nome "Correct"
                },
                select: { uuid: true, balance: true },
            });

            if (!correctUserItem) {
                // Importante: O usuário PRECISA ter um item "Correct" para receber cashback
                throw new CustomError(
                    `User ${userInfoUuid.uuid} does not have a 'Correct' UserItem to receive cashback.`,
                    404
                );
            }
            const correctUserItemId = correctUserItem.uuid;
            const correctItemBalanceBeforeCashback = correctUserItem.balance;
            const correctItemBalanceAfterCashback =
                correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

            // 3. Buscar saldo atual da BusinessAccount
            const currentBusinessAccount = await tx.businessAccount.findFirst({
                // Usar findFirst pois a relação pode não ser unique no schema (embora devesse ser)
                where: { business_info_uuid: favoredBusinessInfoId }, // Busca pelo ID do BusinessInfo
                select: { uuid: true, balance: true }, // Seleciona o UUID e o saldo
            });
            if (!currentBusinessAccount) {
                // Se a conta da empresa DEVE existir para a transação, lançar erro
                throw new CustomError(
                    `BusinessAccount associated with BusinessInfo ${favoredBusinessInfoId} not found.`,
                    404
                );
            }
            const businessAccountId = currentBusinessAccount.uuid; // <<< Pega o UUID aqui
            const businessBalanceBefore = currentBusinessAccount.balance;
            const businessBalanceAfter =
                businessBalanceBefore + netAmountToCreditBusiness;

            // 4. Buscar CorrectAccount (assumindo que só existe uma)
            const currentCorrectAccount = await tx.correctAccount.findFirst({
                // findFirst pois não há ID único óbvio para buscar
                select: { uuid: true, balance: true }, // Seleciona o UUID e o saldo
            });
            if (!currentCorrectAccount) {
                // A conta da plataforma DEVE existir
                throw new CustomError(
                    `CorrectAccount not found. System configuration error.`,
                    500
                );
            }
            const correctAccountId = currentCorrectAccount.uuid; // <<< Pega o UUID aqui
            const correctBalanceBefore = currentCorrectAccount.balance;
            const correctBalanceAfter =
                correctBalanceBefore + netAmountToCreditPlatform;

            // --- Executar Atualizações ---

            // 5. Debitar UserItem DEBITADO
            await tx.userItem.update({
                where: { uuid: debitedUserItemId },
                data: {
                    balance: { decrement: totalAmountToDecrement },
                    updated_at: transactionEntity.updated_at,
                },
            });

            // 6. Creditar BusinessAccount
            await tx.businessAccount.update({
                where: { uuid: businessAccountId }, // Usa o ID buscado
                data: {
                    balance: { increment: netAmountToCreditBusiness },
                    updated_at: transactionEntity.updated_at,
                },
            });

            // 7. Creditar CorrectAccount
            await tx.correctAccount.update({
                where: { uuid: correctAccountId }, // Usa o ID buscado
                data: {
                    balance: { increment: netAmountToCreditPlatform },
                    updated_at: transactionEntity.updated_at,
                },
            });
            // 8. Creditar CASHBACK no UserItem "Correct"
            await tx.userItem.update({
                where: { uuid: correctUserItemId },
                data: {
                    balance: { increment: cashbackAmountToCreditUser },
                    updated_at: transactionEntity.updated_at,
                },
            });

            // 9. Histórico GASTO UserItem DEBITADO
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: debitedUserItemId,
                    event_type: UserItemEventType.ITEM_SPENT,
                    amount: -totalAmountToDecrement,
                    balance_before: debitedUserItemBalanceBefore,
                    balance_after: debitedUserItemBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 10. Histórico CASHBACK UserItem "Correct"
            await tx.userItemHistory.create({
                data: {
                    user_item_uuid: correctUserItemId,
                    event_type: UserItemEventType.CASHBACK_RECEIVED,
                    amount: cashbackAmountToCreditUser,
                    balance_before: correctItemBalanceBeforeCashback,
                    balance_after: correctItemBalanceAfterCashback,
                    related_transaction_uuid: transactionId,
                },
            });

            // 11. Histórico BusinessAccount
            await tx.businessAccountHistory.create({
                data: {
                    business_account_uuid: businessAccountId, // Usa o ID buscado
                    event_type: BusinessAccountEventType.PAYMENT_RECEIVED,
                    amount: netAmountToCreditBusiness,
                    balance_before: businessBalanceBefore,
                    balance_after: businessBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 12. Histórico CorrectAccount
            await tx.correctAccountHistory.create({
                data: {
                    correct_account_uuid: correctAccountId, // Usa o ID buscado
                    event_type: CorrectAccountEventType.PLATFORM_FEE_COLLECTED,
                    amount: netAmountToCreditPlatform,
                    balance_before: correctBalanceBefore,
                    balance_after: correctBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 13. Atualizar Status da Transação Original
            await tx.transactions.update({
                where: { uuid: transactionId },
                data: {
                    status: 'success',
                    user_item_uuid: debitedUserItemId,
                    // Apenas atualizamos o que muda no final do processamento
                    paid_at: newDateF(new Date()),
                    updated_at: newDateF(new Date()),
                },
            });

            return {
                success: true,
                finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
                user_cashback_amount: cashbackAmountToCreditUser,
            };
        }); // Fim do $transaction

        return {
            success: result.success,
            finalDebitedUserItemBalance: result.finalDebitedUserItemBalance,
            user_cashback_amount: cashbackAmountToCreditUser,
        }; // Retorna o resultado da transação
    }

    // Dentro da sua classe de implementação do ITransactionOrderRepository

    async processSplitPostPaidPayment(
        transactionEntity: TransactionEntity,
        userInfoUuid: Uuid
    ): Promise<{
        success: boolean;
        finalDebitedUserItemBalance: number;
        user_cashback_amount: number;
    }> {
        // 1. Extração de Dados da Entidade (em centavos)
        const dataToSave = transactionEntity.toJSON();
        const debitedUserItemId = dataToSave.user_item_uuid;
        const transactionId = dataToSave.uuid;
        const favoredBusinessInfoId = dataToSave.favored_business_info_uuid;
        const totalAmountToDecrement = dataToSave.net_price;
        const netAmountToCreateAsCredit = dataToSave.partner_credit_amount;
        const netAmountToCreditPlatform = dataToSave.fee_amount;
        const cashbackAmountToCreditUser = dataToSave.cashback;

        // 2. Início da Transação Atômica
        const result = await prismaClient.$transaction(async (tx) => {
            // 2.1. Leitura e Validação do Benefício a ser Debitado (Limite de Crédito)
            const debitedUserItem = await tx.userItem.findUnique({
                where: { uuid: debitedUserItemId },
                select: { balance: true, user_info_uuid: true },
            });
            if (!debitedUserItem) {
                throw new CustomError(
                    `Benefício (UUID: ${debitedUserItemId}) não encontrado.`,
                    404
                );
            }
            if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) {
                throw new CustomError(
                    `O benefício ${debitedUserItemId} não pertence ao usuário.`,
                    403
                );
            }
            if (debitedUserItem.balance < totalAmountToDecrement) {
                throw new CustomError(
                    `Limite de crédito insuficiente no benefício.`,
                    403
                );
            }

            const debitedUserItemBalanceBefore = debitedUserItem.balance;
            const debitedUserItemBalanceAfter =
                debitedUserItemBalanceBefore - totalAmountToDecrement;

            // 2.2. Leitura da Carteira de Cashback "Correct"
            const correctUserItem = await tx.userItem.findFirst({
                where: {
                    user_info_uuid: userInfoUuid.uuid,
                    item_name: 'Correct',
                },
                select: { uuid: true, balance: true },
            });
            if (!correctUserItem) {
                throw new CustomError(
                    `Carteira 'Correct' do usuário não encontrada para receber cashback.`,
                    404
                );
            }

            const correctUserItemId = correctUserItem.uuid;
            const correctItemBalanceBeforeCashback = correctUserItem.balance;
            const correctItemBalanceAfterCashback =
                correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

            // 2.3. Leitura da Conta do Parceiro (para obter o UUID de referência)
            const partnerBusinessAccount = await tx.businessAccount.findFirst({
                where: { business_info_uuid: favoredBusinessInfoId },
                select: { uuid: true },
            });
            if (!partnerBusinessAccount) {
                throw new CustomError(
                    `Conta do parceiro (BusinessInfo: ${favoredBusinessInfoId}) não encontrada.`,
                    404
                );
            }
            const partnerBusinessAccountId = partnerBusinessAccount.uuid;

            // 2.4. Leitura da Conta da Plataforma
            const currentCorrectAccount = await tx.correctAccount.findFirst({
                select: { uuid: true, balance: true },
            });
            if (!currentCorrectAccount) {
                throw new CustomError(
                    `Conta da plataforma 'Correct' não encontrada. Erro de sistema.`,
                    500
                );
            }

            const correctAccountId = currentCorrectAccount.uuid;
            const correctBalanceBefore = currentCorrectAccount.balance;
            const correctBalanceAfter =
                correctBalanceBefore + netAmountToCreditPlatform;

            // --- 3. Execução das Operações de Escrita ---

            // 3.1. Debitar o limite do benefício do usuário
            await tx.userItem.update({
                where: { uuid: debitedUserItemId },
                data: { balance: { decrement: totalAmountToDecrement } },
            });

            // 3.2. Creditar a taxa na conta da Correct
            await tx.correctAccount.update({
                where: { uuid: correctAccountId },
                data: { balance: { increment: netAmountToCreditPlatform } },
            });

            // 3.3. Creditar o cashback na carteira "Correct" do usuário
            await tx.userItem.update({
                where: { uuid: correctUserItemId },
                data: { balance: { increment: cashbackAmountToCreditUser } },
            });

            // 3.4. PONTO CHAVE: Criar o registro de Crédito para o Parceiro com a nova lógica de ciclo
            const settlementDate = calculateCycleSettlementDateAsDate(
                new Date()
            );

            await tx.partnerCredit.create({
                data: {
                    business_account_uuid: partnerBusinessAccountId,
                    original_transaction_uuid: transactionId,
                    balance: netAmountToCreateAsCredit,
                    spent_amount: 0,
                    status: 'PENDING',
                    availability_date: settlementDate, // Passando o objeto Date, como recomendado
                },
            });

            // --- 4. Criação dos Registros de Histórico ---

            // 4.1. Históricos de débito e cashback do usuário
            await tx.userItemHistory.createMany({
                data: [
                    {
                        user_item_uuid: debitedUserItemId,
                        event_type: 'ITEM_SPENT',
                        amount: -totalAmountToDecrement,
                        balance_before: debitedUserItemBalanceBefore,
                        balance_after: debitedUserItemBalanceAfter,
                        related_transaction_uuid: transactionId,
                    },
                    {
                        user_item_uuid: correctUserItemId,
                        event_type: 'CASHBACK_RECEIVED',
                        amount: cashbackAmountToCreditUser,
                        balance_before: correctItemBalanceBeforeCashback,
                        balance_after: correctItemBalanceAfterCashback,
                        related_transaction_uuid: transactionId,
                    },
                ],
            });

            // 4.2. Histórico da taxa da plataforma
            await tx.correctAccountHistory.create({
                data: {
                    correct_account_uuid: correctAccountId,
                    event_type: 'PLATFORM_FEE_COLLECTED',
                    amount: netAmountToCreditPlatform,
                    balance_before: correctBalanceBefore,
                    balance_after: correctBalanceAfter,
                    related_transaction_uuid: transactionId,
                },
            });

            // 4.3. Atualizar a transação principal para "success"
            await tx.transactions.update({
                where: { uuid: transactionId },
                data: {
                    status: 'success',
                    user_item_uuid: debitedUserItemId,
                    paid_at: newDateF(new Date()),
                    updated_at: newDateF(new Date()),
                },
            });

            // 5. Retorno
            return {
                success: true,
                finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
                user_cashback_amount: cashbackAmountToCreditUser,
            };
        });

        return result;
    }

    async savePOSTransaction(
        entity: TransactionEntity
    ): Promise<TransactionEntity> {
        const dataToSave = entity.toJSON();
        const createdTxData = await prismaClient.transactions.create({
            data: {
                uuid: dataToSave.uuid,
                favored_user_uuid: dataToSave.favored_user_uuid,
                favored_business_info_uuid:
                    dataToSave.favored_business_info_uuid,
                payer_business_info_uuid: dataToSave.payer_business_info_uuid,
                original_price: dataToSave.original_price,
                discount_percentage: dataToSave.discount_percentage,
                net_price: dataToSave.net_price,
                fee_percentage: dataToSave.fee_percentage,
                fee_amount: dataToSave.fee_amount,
                partner_credit_amount: dataToSave.partner_credit_amount,
                platform_net_fee_amount: dataToSave.platform_net_fee_amount,
                cashback: dataToSave.cashback,
                description: dataToSave.description,
                status: dataToSave.status,
                transaction_type: dataToSave.transaction_type,
                favored_partner_user_uuid: dataToSave.favored_partner_user_uuid,
                created_at: dataToSave.created_at,
            },
        });
        // CRUCIAL: Após criar, buscamos novamente para ter todos os dados
        // e hidratamos para retornar uma instância de classe real.
        const finalTxData = await prismaClient.transactions.findUnique({
            where: { uuid: createdTxData.uuid },
        });

        const transactionProps: TransactionProps = {
            uuid: new Uuid(finalTxData.uuid),
            user_item_uuid: finalTxData.user_item_uuid
                ? new Uuid(finalTxData.user_item_uuid)
                : null,
            favored_user_uuid: finalTxData.favored_user_uuid
                ? new Uuid(finalTxData.favored_user_uuid)
                : null,
            favored_business_info_uuid: finalTxData.favored_business_info_uuid
                ? new Uuid(finalTxData.favored_business_info_uuid)
                : null,
            original_price: finalTxData.original_price,
            discount_percentage: finalTxData.discount_percentage,
            net_price: finalTxData.net_price,
            fee_percentage: finalTxData.fee_percentage,
            fee_amount: finalTxData.fee_amount,
            partner_credit_amount: finalTxData.partner_credit_amount,
            platform_net_fee_amount: finalTxData.platform_net_fee_amount,
            cashback: finalTxData.cashback,
            description: finalTxData.description,
            status: finalTxData.status,
            transaction_type: finalTxData.transaction_type,
            favored_partner_user_uuid: finalTxData.favored_partner_user_uuid
                ? new Uuid(finalTxData.favored_partner_user_uuid)
                : null,
            paid_at: finalTxData.paid_at,
            created_at: finalTxData.created_at,
            updated_at: finalTxData.updated_at,
        };

        return TransactionEntity.hydrate(transactionProps);
    }

    public async processPaymentByBusiness(
        params: ProcessPaymentByBusinessParams
    ): Promise<ProcessPaymentByBusinessResult> {
        const {
            transaction,
            payerAccount,
            payerCredits,
            sellerBusinessInfoId,
        } = params;

        const result = await prismaClient.$transaction(async (tx) => {
            // --- PASSO 1: INICIALIZAÇÃO E PREPARAÇÃO ---
            const transactionJson = transaction.toJSON();
            let amountToPayInCents = transactionJson.net_price;
            let totalPaidFromCredits = 0;
            let totalPaidFromLiquid = 0;

            // --- PASSO 2: BUSCAR A CONTA DO VENDEDOR ---
            const sellerAccount = await tx.businessAccount.findFirst({
                where: { business_info_uuid: sellerBusinessInfoId },
            });
            if (!sellerAccount) {
                throw new CustomError(
                    'Conta do parceiro vendedor não encontrada.',
                    404
                );
            }

            // --- PASSO 3: LÓGICA DE CONSUMO DE CRÉDITOS (FIFO) ---
            for (const creditToSpend of payerCredits) {
                if (amountToPayInCents <= 0) break; // Para o loop se o pagamento já foi coberto

                const creditBalanceInCents = creditToSpend.toJSON().balance; // Pega o saldo em centavos
                const spendAmount = Math.min(
                    amountToPayInCents,
                    creditBalanceInCents
                );

                // 1. Aplica a regra de negócio na entidade (diminui o saldo interno)
                creditToSpend.spend(spendAmount);
                const updatedCreditJson = creditToSpend.toJSON();

                // 2. Persiste a alteração do crédito gasto no banco
                await tx.partnerCredit.update({
                    where: { uuid: updatedCreditJson.uuid },
                    data: {
                        balance: updatedCreditJson.balance,
                        spent_amount: updatedCreditJson.spent_amount,
                    },
                });

                // 3. Calcula a NOVA data de liquidação para o vendedor
                const newSettlementDate = calculateCycleSettlementDateAsDate(
                    new Date()
                );

                // 4. Cria o novo crédito para o vendedor (transferência do recebível)
                await tx.partnerCredit.create({
                    data: {
                        business_account_uuid: sellerAccount.uuid,
                        original_transaction_uuid: transactionJson.uuid,
                        balance: spendAmount,
                        spent_amount: 0,
                        status: 'PENDING',
                        availability_date: newSettlementDate,
                    },
                });

                // 5. Registra o gasto do crédito para fins de auditoria
                await tx.partnerCreditSpend.create({
                    data: {
                        partner_credit_uuid: creditToSpend.uuid.uuid,
                        spending_transaction_uuid: transactionJson.uuid,
                        amount_spent: spendAmount,
                    },
                });

                // 6. Atualiza os contadores
                totalPaidFromCredits += spendAmount;
                amountToPayInCents -= spendAmount;
            }

            // --- PASSO 4: LÓGICA DE CONSUMO DE SALDO LÍQUIDO (SE NECESSÁRIO) ---
            if (amountToPayInCents > 0) {
                totalPaidFromLiquid = amountToPayInCents;
                const payerAccountJson = payerAccount.toJSON();

                // 1. Debita do saldo líquido do pagador
                const updatedPayerAccount = await tx.businessAccount.update({
                    where: { uuid: payerAccountJson.uuid },
                    data: { balance: { decrement: totalPaidFromLiquid } },
                });

                // 2. Credita no saldo líquido do vendedor
                const updatedSellerAccount = await tx.businessAccount.update({
                    where: { uuid: sellerAccount.uuid },
                    data: { balance: { increment: totalPaidFromLiquid } },
                });

                // 3. Cria históricos para a movimentação de saldo líquido
                await tx.businessAccountHistory.createMany({
                    data: [
                        {
                            // Histórico de débito para o pagador
                            business_account_uuid: payerAccountJson.uuid,
                            event_type: 'PAYOUT_PROCESSED', // ou um tipo mais específico como "P2P_PAYMENT_SENT"
                            amount: -totalPaidFromLiquid,
                            balance_before: payerAccountJson.balance,
                            balance_after: updatedPayerAccount.balance,
                            related_transaction_uuid: transactionJson.uuid,
                        },
                        {
                            // Histórico de crédito para o vendedor
                            business_account_uuid: sellerAccount.uuid,
                            event_type: 'PAYMENT_RECEIVED',
                            amount: totalPaidFromLiquid,
                            balance_before: sellerAccount.balance,
                            balance_after: updatedSellerAccount.balance,
                            related_transaction_uuid: transactionJson.uuid,
                        },
                    ],
                });
            }

            // --- PASSO 5: FINALIZAÇÃO DA TRANSAÇÃO ORIGINAL ---
            await tx.transactions.update({
                where: { uuid: transactionJson.uuid },
                data: {
                    status: 'success',
                    paid_at: newDateF(new Date()),
                    updated_at: newDateF(new Date()),
                    payer_business_info_uuid:
                        payerAccount.toJSON().business_info_uuid,
                },
            });

            // --- PASSO 6: RETORNO PARA O USE CASE ---
            const finalPayerAccountState = await tx.businessAccount.findUnique({
                where: { uuid: payerAccount.uuid.uuid },
            });

            return {
                amountPaidFromCredits: totalPaidFromCredits,
                amountPaidFromLiquidBalance: totalPaidFromLiquid,
                payerFinalLiquidBalance: finalPayerAccountState.balance,
            };
        });

        return result;
    }
    async find(id: Uuid): Promise<TransactionEntity | null> {
        // 1. Busca os dados brutos da transação no banco de dados
        const transactionData = await prismaClient.transactions.findUnique({
            where: {
                uuid: id.uuid,
            },
        });

        if (!transactionData) {
            return null;
        }

        // 2. Prepara as 'props' para a hidratação, convertendo strings para Value Objects
        const transactionProps: TransactionProps = {
            uuid: new Uuid(transactionData.uuid),
            user_item_uuid: transactionData.user_item_uuid
                ? new Uuid(transactionData.user_item_uuid)
                : null,
            favored_user_uuid: transactionData.favored_user_uuid
                ? new Uuid(transactionData.favored_user_uuid)
                : null,
            favored_business_info_uuid:
                transactionData.favored_business_info_uuid
                    ? new Uuid(transactionData.favored_business_info_uuid)
                    : null,
            original_price: transactionData.original_price,
            discount_percentage: transactionData.discount_percentage,
            net_price: transactionData.net_price,
            fee_percentage: transactionData.fee_percentage,
            fee_amount: transactionData.fee_amount,
            partner_credit_amount: transactionData.partner_credit_amount,
            platform_net_fee_amount: transactionData.platform_net_fee_amount,
            cashback: transactionData.cashback,
            description: transactionData.description,
            status: transactionData.status,
            transaction_type: transactionData.transaction_type,
            favored_partner_user_uuid: transactionData.favored_partner_user_uuid
                ? new Uuid(transactionData.favored_partner_user_uuid)
                : null,
            paid_at: transactionData.paid_at,
            created_at: transactionData.created_at,
            updated_at: transactionData.updated_at,
        };

        // 3. Usa o método estático 'hydrate' para reconstruir a entidade completa.
        //    Isso garante que o objeto retornado seja uma instância de classe real.
        return TransactionEntity.hydrate(transactionProps);
    }

    async create(entity: TransactionEntity): Promise<void> {
        const dataToPersist = {
            // IDs Básicos
            uuid: entity.uuid.uuid,
            created_at: entity.created_at,
            updated_at: new Date().toISOString(), // Atualiza sempre que salvar

            subscription_uuid: entity.subscription_uuid?.uuid ?? null,

            user_item_uuid: entity.user_item_uuid?.uuid ?? null,
            favored_user_uuid: entity.favored_user_uuid?.uuid ?? null,
            favored_business_info_uuid:
                entity.favored_business_info_uuid?.uuid ?? null,
            payer_business_info_uuid:
                entity.payer_business_info_uuid?.uuid ?? null,
            favored_partner_user_uuid:
                entity.favored_partner_user_uuid?.uuid ?? null,
            original_price: Math.round(entity.original_price * 100),
            net_price: Math.round(entity.net_price * 100),
            fee_amount: Math.round(entity.fee_amount * 100),
            cashback: Math.round(entity.cashback * 100),
            platform_net_fee_amount: Math.round(
                entity.platform_net_fee_amount * 100
            ),
            partner_credit_amount: Math.round(
                entity.partner_credit_amount * 100
            ),
            discount_percentage: Math.round(entity.discount_percentage * 10000),
            fee_percentage: Math.round((entity.fee_percentage ?? 0) * 10000),
            description: entity.description,
            status: entity.status,
            transaction_type: entity.transaction_type,

            // Dados do Provedor / Pix
            provider_tx_id: entity.provider_tx_id,
            pix_e2e_id: entity.pix_e2e_id,
            paid_at: entity.paid_at ?? null,

            // Outros
            used_offline_token_code: entity.used_offline_token_code ?? null,
            // item_uuid: entity.item_uuid ?? null, // Se este campo existir no prisma schema
        };

        // --- PERSISTÊNCIA ---
        await prismaClient.transactions.create({
            data: dataToPersist,
        });
    }
    update(entity: TransactionEntity): Promise<void> {
        throw new CustomError('Method not implemented.');
    }

    findAll(): Promise<TransactionEntity[]> {
        throw new CustomError('Method not implemented.');
    }
}

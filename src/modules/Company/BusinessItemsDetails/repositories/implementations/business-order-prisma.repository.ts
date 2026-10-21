import { PrismaClient, BusinessOrder, TransactionType } from "@prisma/client";
import { BusinessOrderWithDetails, IBusinessOrderRepository } from "../business-order-repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CustomError } from "../../../../../errors/custom.error";
import { newDateF } from "../../../../../utils/date";

export class BusinessOrderPrismaRepository implements IBusinessOrderRepository {

    async findByProviderTxId(txid: string): Promise<BusinessOrderWithDetails | null> {
        return await prismaClient.businessOrder.findFirst({
            where: { provider_tx_id: txid },
            include: {
                OrderItems: true,
                Business: true
            }
        });
    }

    async findById(uuid: string): Promise<BusinessOrderWithDetails | null> {
        return await prismaClient.businessOrder.findUnique({
            where: { uuid },
            include: {
                OrderItems: true, // Necessário para calcular os créditos
                Business: true    // Necessário para pegar o e-mail do RH
            }
        });
    }

    async approveOrderTransaction(orderUuid: string): Promise<void> {
        const order = await prismaClient.businessOrder.findUnique({
            where: { uuid: orderUuid },
            include: { OrderItems: true }
        });

        if (!order) throw new CustomError("Order not found for approval", 404);

        // CONFIGURAÇÃO DO TIMEOUT AQUI
        // Passamos um segundo argumento com as opções
        await prismaClient.$transaction(async (tx) => {

            // A. Atualiza Status do Pedido
            await tx.businessOrder.update({
                where: { uuid: orderUuid },
                data: { status: 'PAID' }
            });

            // B. Credita cada colaborador
            for (const item of order.OrderItems) {

                const currentUserItem = await tx.userItem.findUnique({
                    where: { uuid: item.user_item_uuid }
                });

                if (!currentUserItem) continue;

                const newBalance = currentUserItem.balance + item.amount;

                await tx.userItem.update({
                    where: { uuid: item.user_item_uuid },
                    data: {
                        balance: { increment: item.amount }
                    }
                });

                await tx.userItemHistory.create({
                    data: {
                        user_item_uuid: item.user_item_uuid,
                        event_type: 'BENEFIT_CREDITED',
                        amount: item.amount,
                        balance_before: currentUserItem.balance,
                        balance_after: newBalance,
                    }
                });
            }
        }, {
            maxWait: 5000,
            timeout: 20000
        });
    }
    async create(
        businessInfoUuid: string,
        itemUuid: string,
        totalAmountCents: number,
        items: { user_item_uuid: string; amount_cents: number; beneficiary_snapshot: any }[], providerTxId?: string
    ): Promise<BusinessOrder> {

        const result = await prismaClient.$transaction(async (tx) => {

            const order = await tx.businessOrder.create({
                data: {
                    business_info_uuid: businessInfoUuid,
                    item_uuid: itemUuid,
                    total_amount: totalAmountCents,
                    status: 'PENDING',
                    provider_tx_id: providerTxId || null,
                }
            });

            await tx.transactions.create({
                data: {
                    payer_business_info_uuid: businessInfoUuid,
                    original_price: totalAmountCents,
                    net_price: totalAmountCents,
                    partner_credit_amount: totalAmountCents,
                    status: 'pending',
                    transaction_type: TransactionType.COMPANY_PRE_PAID_RECHARGE,
                    provider_tx_id: providerTxId || null,
                    description: `Recarga de Benefícios Pré-pagos (Pedido ${order.uuid})`,
                    created_at: newDateF(new Date())
                }
            });

            await tx.businessOrderItem.createMany({
                data: items.map(item => ({
                    order_uuid: order.uuid,
                    user_item_uuid: item.user_item_uuid,
                    amount: item.amount_cents,

                    // CORREÇÃO 2: Agora pegamos o valor que veio do UseCase
                    beneficiary_snapshot: item.beneficiary_snapshot
                }))
            });

            return order;
        });

        return result;
    }

    async findAllByBusinessAndItem(
        businessInfoUuid: string,
        itemUuid: string
    ): Promise<(BusinessOrder & { _count: { OrderItems: number } })[]> {
        return await prismaClient.businessOrder.findMany({
            where: {
                business_info_uuid: businessInfoUuid,
                item_uuid: itemUuid
            },
            include: {
                _count: {
                    select: { OrderItems: true }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }
    async findAll(params: { status?: string, page: number, limit: number }): Promise<{ data: BusinessOrderWithDetails[]; count: number }> {
        const where: any = params.status ? { status: params.status } : {};
        const skip = (params.page - 1) * params.limit;
        const take = params.limit;

        const [data, count] = await prismaClient.$transaction([
            prismaClient.businessOrder.findMany({
                where,
                skip,
                take,
                include: {
                    Business: true,
                    OrderItems: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prismaClient.businessOrder.count({ where })
        ]);


        return { data, count };
    }
} 
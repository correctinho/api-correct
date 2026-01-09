import { PrismaClient, BusinessOrder } from "@prisma/client";
import { BusinessOrderWithDetails, IBusinessOrderRepository } from "../business-order-repository";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CustomError } from "../../../../../errors/custom.error";

export class BusinessOrderPrismaRepository implements IBusinessOrderRepository {
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
        items: { user_item_uuid: string; amount_cents: number; beneficiary_snapshot: any }[]
    ): Promise<BusinessOrder> {
        
        const result = await prismaClient.$transaction(async (tx) => {
            
            const order = await tx.businessOrder.create({
                data: {
                    business_info_uuid: businessInfoUuid,
                    item_uuid: itemUuid,
                    total_amount: totalAmountCents,
                    status: 'PENDING',
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
): Promise<BusinessOrder[]> {
    return await prismaClient.businessOrder.findMany({
        where: {
            business_info_uuid: businessInfoUuid,
            item_uuid: itemUuid
        },
        orderBy: {
            created_at: 'desc' // Os mais recentes primeiro
        }
    });
}
}
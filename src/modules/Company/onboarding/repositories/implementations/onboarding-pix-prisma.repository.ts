import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { CreatePendingPixTransactionDTO, IOnboardingPixRepository } from "../IOnboardingPixRepository";
import { TransactionStatus, TransactionType } from "@prisma/client";

export class OnboardingPixPrismaRepository implements IOnboardingPixRepository {
    async getBusinessInfo(uuid: string): Promise<any> {
        return await prismaClient.businessInfo.findUnique({
            where: { uuid: uuid }
        });
    }

    async getSystemConfig(key: string): Promise<string | null> {
        const config = await prismaClient.systemConfig.findUnique({
            where: { key: key }
        });
        return config ? config.value : null;
    }

    async createPendingTransaction(data: CreatePendingPixTransactionDTO): Promise<void> {
        await prismaClient.transactions.create({
            data: {
                status: TransactionStatus.pending,
                transaction_type: TransactionType.ONBOARDING_PIX,
                payer_business_info_uuid: data.payer_business_info_uuid,
                provider_tx_id: data.provider_tx_id,
                original_price: data.original_price,
                net_price: data.net_price,
                description: 'Taxa de Adesão',
                created_at: newDateF(new Date()),
                partner_credit_amount: 0
            }
        });
    }
}

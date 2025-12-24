import { SubscriptionStatus } from "@prisma/client";

export interface InputHireUserSubscriptionByCorrectBalanceDTO {
    userId: string;
    subscriptionPlanUuid: string;
    acceptedTermsVersionUuid: string;
    ip_address: string | null;
    user_agent: string | null;
}

export interface OutputHireUserSubscriptionByCorrectBalanceDTO {
    subscriptionUuid: string;
    status: SubscriptionStatus; // Será sempre ACTIVE
    startDate: Date;
    endDate: Date;
    itemName: string; // Nome do serviço liberado
}
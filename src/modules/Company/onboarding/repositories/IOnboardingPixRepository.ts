export interface CreatePendingPixTransactionDTO {
    payer_business_info_uuid: string;
    provider_tx_id: string;
    original_price: number;
    net_price: number;
}

export interface IOnboardingPixRepository {
    getBusinessInfo(uuid: string): Promise<{ uuid: string, status: string, document: string, fantasy_name: string } | null>;
    getSystemConfig(key: string): Promise<string | null>;
    createPendingTransaction(data: CreatePendingPixTransactionDTO): Promise<void>;
}


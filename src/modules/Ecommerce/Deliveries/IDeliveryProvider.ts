export interface QuoteDeliveryInput {
    origin: {
        lat: number;
        lng: number;
    };
    destination: {
        lat: number;
        lng: number;
    };
}

export interface QuoteDeliveryOutput {
    priceInCents: number;
    estimatedMinutes?: number;
    estimatedKm?: number;
}

export interface CreateDeliveryInput {
    transactionUuid: string;
    origin: {
        address: string;
        neighborhood: string;
        city: string;
        state: string;
        lat: number;
        lng: number;
    };
    destination: {
        name: string;
        phone: string;
        observations?: string;
        address: string;
        neighborhood: string;
        city: string;
        state: string;
        lat: number;
        lng: number;
    };
}

export interface CreateDeliveryOutput {
    externalDeliveryId: string;
}

export interface IDeliveryProvider {
    quoteDelivery(input: QuoteDeliveryInput): Promise<QuoteDeliveryOutput>;
    createDelivery(input: CreateDeliveryInput): Promise<CreateDeliveryOutput>;
}

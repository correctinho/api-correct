export interface QuoteDeliveryInput {
    origin: {
        lat: string | number;
        lng: string | number;
        addressLine: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    destination: {
        lat: string | number;
        lng: string | number;
        addressLine: string;
        neighborhood: string;
        city: string;
        state: string;
    };
}

export interface QuoteDeliveryOutput {
    priceInCents: number;
    estimatedMinutes: number;
    estimatedKm: number;
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

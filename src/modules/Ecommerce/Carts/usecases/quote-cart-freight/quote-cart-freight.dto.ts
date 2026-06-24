export interface QuoteCartFreightInput {
    cart_uuid: string;
    destination_lat?: number;
    destination_lng?: number;
    destination_street: string;
    destination_number: string;
    destination_complement?: string;
    destination_neighborhood: string;
    destination_cep?: string;
}

export interface QuoteCartFreightOutput {
    freight_amount: number;
    estimated_minutes: number;
    expires_at: string;
}
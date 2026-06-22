export interface QuoteCartFreightInput {
    cart_uuid: string;
    destination_lat: number;
    destination_lng: number;
    destination_address: string;
}

export interface QuoteCartFreightOutput {
    freight_amount: number;
    estimated_minutes: number;
    expires_at: string; // Data ISO indicando quando o TTL vence
}

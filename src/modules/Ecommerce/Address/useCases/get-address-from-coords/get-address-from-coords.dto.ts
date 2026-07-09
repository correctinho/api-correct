export interface GetAddressFromCoordsInput {
    lat: number;
    lng: number;
}

export interface GetAddressFromCoordsOutput {
    line1: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
}

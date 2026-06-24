import { CustomError } from "../../../../../errors/custom.error";
import { reverseGeocodeAddress } from "../../../../../utils/geocoder";
import { GetAddressFromCoordsInput, GetAddressFromCoordsOutput } from "./get-address-from-coords.dto";

export class GetAddressFromCoordsUseCase {
    constructor() { }

    async execute(input: GetAddressFromCoordsInput): Promise<GetAddressFromCoordsOutput> {
        if (!input.lat || !input.lng) {
            throw new CustomError("Latitude and longitude are required.", 400);
        }

        const address = await reverseGeocodeAddress(Number(input.lat), Number(input.lng));

        if (!address) {
            throw new CustomError("Address not found for the given coordinates.", 404);
        }

        return {
            line1: address.line1 || "",
            neighborhood: address.neighborhood || "",
            city: address.city || "",
            state: address.state || "",
            postal_code: address.postal_code || ""
        };
    }
}

import { ICartRepository } from "../../repositories/cart.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { IDeliveryProvider } from "../../../Deliveries/IDeliveryProvider";
import { QuoteCartFreightInput, QuoteCartFreightOutput } from "./quote-cart-freight.dto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { geocodeAddress } from "../../../../../utils/geocoder";

export class QuoteCartFreightUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private partnerConfigRepository: IPartnerConfigRepository,
        private deliveryProvider: IDeliveryProvider
    ) { }

    async execute(input: QuoteCartFreightInput): Promise<QuoteCartFreightOutput> {
        const cartId = new Uuid(input.cart_uuid);
        const cart = await this.cartRepository.findCartById(cartId);

        if (!cart) {
            throw new CustomError("Carrinho não encontrado.", 404);
        }

        const businessInfoUuidStr = cart.business_info_uuid.uuid;
        const partnerConfig = await this.partnerConfigRepository.findByBusinessInfoId(businessInfoUuidStr);

        if (!partnerConfig || !partnerConfig.DispatchAddress || !partnerConfig.DispatchAddress.latitude || !partnerConfig.DispatchAddress.longitude) {
            throw new CustomError("O endereço de retirada (despacho) do parceiro não está configurado.", 400);
        }

        const dispatchAddress = partnerConfig.DispatchAddress;

        // Montamos o endereço de forma estruturada e profissional para o Motoboy
        const complementStr = input.destination_complement ? ` - ${input.destination_complement}` : '';
        const destAddressLine = `${input.destination_street}, ${input.destination_number}${complementStr}`;
        const destNeighborhood = input.destination_neighborhood;

        let destLat = input.destination_lat;
        let destLng = input.destination_lng;

        // Se o frontend enviou apenas o texto (Cenário 2: Digitou o CEP), nós descobrimos as coordenadas:
        if (!destLat || !destLng) {
            try {
                // A função geocodeAddress que você já tem configurada no seu utils
                const geo = await geocodeAddress(
                    input.destination_number,
                    `${input.destination_street}, Campo Grande, MS, Brasil`,
                    input.destination_cep || ''
                );

                // Validação defensiva: se o geocoder retornar 'not found', paramos a execução
                if (geo.lat === 'not found' || geo.long === 'not found') {
                    throw new CustomError("Não foi possível encontrar as coordenadas exatas deste endereço. Verifique o número e a rua.", 400);
                }

                destLat = geo.lat;
                destLng = geo.long;
            } catch (error: any) {
                if (error instanceof CustomError) throw error;
                throw new CustomError("Erro ao processar localização do endereço.", 400);
            }
        }
        try {
            const quote = await this.deliveryProvider.quoteDelivery({
                origin: {
                    lat: dispatchAddress.latitude,
                    lng: dispatchAddress.longitude,
                    addressLine: `${dispatchAddress.line1}, ${dispatchAddress.line2 || 'S/N'}`,
                    neighborhood: dispatchAddress.neighborhood || 'Centro',
                    city: dispatchAddress.city || 'Campo Grande',
                    state: dispatchAddress.state || 'MS'
                },
                destination: {
                    lat: destLat, // Usamos a variável tratada
                    lng: destLng, // Usamos a variável tratada
                    addressLine: destAddressLine,
                    neighborhood: destNeighborhood,
                    city: 'Campo Grande',
                    state: 'MS'
                }
            });

            const ttlMinutes = parseInt(process.env.FREIGHT_QUOTE_TTL_MINUTES || '15', 10);
            const quotedAt = new Date();
            const expiresAt = new Date(quotedAt.getTime() + ttlMinutes * 60000);

            // Salvamos a string completa no carrinho para fins de histórico/exibição
            const fullAddressToSave = `${destAddressLine}, ${destNeighborhood}`;

            await this.cartRepository.updateFreight(cartId, {
                amount: quote.priceInCents,
                minutes: quote.estimatedMinutes || 0,
                lat: destLat,
                lng: destLng,
                address: fullAddressToSave,
                quoted_at: quotedAt
            });

            return {
                freight_amount: quote.priceInCents,
                estimated_minutes: quote.estimatedMinutes || 0,
                expires_at: expiresAt.toISOString()
            };
        } catch (error: any) {
            throw new CustomError(error.message || "Erro ao calcular o frete com a transportadora.", 400);
        }
    }
}
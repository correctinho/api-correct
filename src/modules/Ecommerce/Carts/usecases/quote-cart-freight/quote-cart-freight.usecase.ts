import { ICartRepository } from "../../repositories/cart.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { IDeliveryProvider } from "../../../Deliveries/IDeliveryProvider";
import { QuoteCartFreightInput, QuoteCartFreightOutput } from "./quote-cart-freight.dto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export class QuoteCartFreightUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private partnerConfigRepository: IPartnerConfigRepository,
        private deliveryProvider: IDeliveryProvider
    ) { }

    async execute(input: QuoteCartFreightInput): Promise<QuoteCartFreightOutput> {
        // Correção: Usando o Value Object Uuid e o método robusto existente
        const cartId = new Uuid(input.cart_uuid);
        const cart = await this.cartRepository.findCartById(cartId);

        if (!cart) {
            throw new Error("Carrinho não encontrado");
        }

        // Correção: Extraindo o UUID como string para buscar o PartnerConfig
        // Nota: Assumindo que cart.business_info_uuid expõe a propriedade .uuid (ou o getter apropriado da sua entidade)
        const businessInfoUuidStr = cart.business_info_uuid.uuid;

        const partnerConfig = await this.partnerConfigRepository.findByBusinessInfoId(businessInfoUuidStr);

        if (!partnerConfig || !partnerConfig.DispatchAddress || !partnerConfig.DispatchAddress.latitude || !partnerConfig.DispatchAddress.longitude) {
            throw new Error("Parceiro não configurado");
        }

        const originLat = partnerConfig.DispatchAddress.latitude;
        const originLng = partnerConfig.DispatchAddress.longitude;

        const quote = await this.deliveryProvider.quoteDelivery({
            origin: {
                lat: originLat,
                lng: originLng
            },
            destination: {
                lat: input.destination_lat,
                lng: input.destination_lng
            }
        });

        const ttlMinutes = parseInt(process.env.FREIGHT_QUOTE_TTL_MINUTES || '15', 10);
        const quotedAt = new Date();
        const expiresAt = new Date(quotedAt.getTime() + ttlMinutes * 60000);

        // Correção: Passando o cartId como objeto Uuid
        await this.cartRepository.updateFreight(cartId, {
            amount: quote.priceInCents,
            minutes: quote.estimatedMinutes || 0,
            lat: input.destination_lat,
            lng: input.destination_lng,
            address: input.destination_address,
            quoted_at: quotedAt
        });

        return {
            freight_amount: quote.priceInCents,
            estimated_minutes: quote.estimatedMinutes || 0,
            expires_at: expiresAt.toISOString()
        };
    }
}
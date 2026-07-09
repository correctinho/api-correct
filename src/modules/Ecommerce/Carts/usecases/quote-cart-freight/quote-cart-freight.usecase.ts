import { ICartRepository } from "../../repositories/cart.repository";
import { IPartnerConfigRepository } from "../../../../Company/PartnerConfig/repositories/partner-config.repository";
import { IDeliveryProvider } from "../../../Deliveries/IDeliveryProvider";
import { QuoteCartFreightInput, QuoteCartFreightOutput } from "./quote-cart-freight.dto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { geocodeAddress } from "../../../../../utils/geocoder";

import { AddressEntity } from "../../../../../infra/shared/address/address.entity";
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
        let destLat = input.destination_lat;
        let destLng = input.destination_lng;

        // Se o frontend não enviou GPS, nós descobrimos as coordenadas (Geocoding):
        if (!destLat || !destLng) {
            if (!input.destination_cep) {
                throw new CustomError("CEP é obrigatório para calcular a localização caso as coordenadas GPS não sejam fornecidas.", 400);
            }
            try {
                const geo = await geocodeAddress(input.destination_number, input.destination_street, input.destination_cep);
                destLat = geo.lat;
                destLng = geo.long;
            } catch (error) {
                throw new CustomError("Não foi possível encontrar as coordenadas exatas para este endereço.", 400);
            }
        }

        // =======================================================================
        // Cria e salva a Entidade de Endereço GLOBAL no Banco de Dados
        // =======================================================================
        const addressEntity = await AddressEntity.create({
            line1: input.destination_street,
            line2: input.destination_number,
            line3: input.destination_complement || null,
            neighborhood: input.destination_neighborhood,
            postal_code: input.destination_cep,
            city: input.destination_city,
            state: input.destination_state,
            country: input.destination_country,
            latitude: destLat,
            longitude: destLng
        });

        // =======================================================================
        // O endereço será criado junto com a atualização do frete no carrinho
        // =======================================================================

        try {
            // Monta payload rigoroso para a TaxiMachine
            const payload = {
                origin: {
                    lat: dispatchAddress.latitude,
                    lng: dispatchAddress.longitude,
                    addressLine: `${dispatchAddress.line1}, ${dispatchAddress.line2 || 'S/N'}`,
                    neighborhood: dispatchAddress.neighborhood || 'Centro', // TODO: Remover fallbacks se a origem for validada
                    city: dispatchAddress.city || 'Campo Grande',           // TODO: Remover fallbacks se a origem for validada
                    state: dispatchAddress.state || 'MS'
                },
                destination: {
                    lat: addressEntity.latitude!,
                    lng: addressEntity.longitude!,
                    addressLine: `${addressEntity.line1}, ${addressEntity.line2}`,
                    neighborhood: addressEntity.neighborhood!,
                    city: addressEntity.city!,
                    state: addressEntity.state!
                }
            };

            const quote = await this.deliveryProvider.quoteDelivery(payload);

            const ttlMinutes = parseInt(process.env.FREIGHT_QUOTE_TTL_MINUTES || '15', 10);
            const quotedAt = new Date();
            const expiresAt = new Date(quotedAt.getTime() + ttlMinutes * 60000);

            // =======================================================================
            // Atualiza o Carrinho passando a Entidade de Endereço
            // =======================================================================
            await this.cartRepository.updateFreight(cartId, {
                amount: quote.priceInCents,
                minutes: quote.estimatedMinutes || 0,
                address: addressEntity,
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
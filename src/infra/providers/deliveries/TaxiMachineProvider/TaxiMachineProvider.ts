import { CreateDeliveryInput, CreateDeliveryOutput, IDeliveryProvider, QuoteDeliveryInput, QuoteDeliveryOutput } from '../../../../modules/Ecommerce/Deliveries/IDeliveryProvider';
import { taxiMachineApi } from './taximachine-api';

export class TaxiMachineProvider implements IDeliveryProvider {
    async quoteDelivery(input: QuoteDeliveryInput): Promise<QuoteDeliveryOutput> {
        const response = await taxiMachineApi.get('/api/integracao/estimarSolicitacao', {
            params: {
                lat_partida: input.origin.lat,
                lng_partida: input.origin.lng,
                lat_desejado: input.destination.lat,
                lng_desejado: input.destination.lng,
            }
        });

        // O mapeamento assume que a API pode encapsular os dados dentro da chave 'response' ou diretamente no body
        const data = response.data?.response || response.data;
        const estimativaValor = parseFloat(data.estimativa_valor);

        return {
            priceInCents: Math.round(estimativaValor * 100),
            estimatedMinutes: data.estimativa_minutos,
            estimatedKm: data.estimativa_km,
        };
    }

    async createDelivery(input: CreateDeliveryInput): Promise<CreateDeliveryOutput> {
        const payload = {
            forma_pagamento: 'F',
            empresa_id: Number(process.env.TAXIMACHINE_EMPRESA_ID),
            coleta: {
                endereco_coleta: input.origin.address,
                bairro_coleta: input.origin.neighborhood,
                cidade_coleta: input.origin.city,
                estado_coleta: input.origin.state,
                lat_coleta: input.origin.lat,
                lng_coleta: input.origin.lng,
            },
            paradas: [
                {
                    id_externo: input.transactionUuid,
                    nome_cliente_parada: input.destination.name,
                    telefone_cliente_parada: input.destination.phone,
                    observacao_parada: input.destination.observations || '',
                    endereco_parada: input.destination.address,
                    bairro_parada: input.destination.neighborhood,
                    cidade_parada: input.destination.city,
                    estado_parada: input.destination.state,
                    lat_parada: input.destination.lat,
                    lng_parada: input.destination.lng,
                }
            ]
        };

        const response = await taxiMachineApi.post('/api/integracao/abrirSolicitacao', payload);
        const data = response.data?.response || response.data;

        return {
            externalDeliveryId: String(data.id_mch),
        };
    }

    async registerWebhook(url: string, type: 'posicao' | 'status'): Promise<any> {
        const response = await taxiMachineApi.post('/api/integracao/cadastrarWebhook', {
            tipo: type,
            url: url,
            responsabilidade: 'corrida'
        });
        return response.data;
    }

    async listWebhooks(): Promise<any> {
        const response = await taxiMachineApi.get('/api/integracao/listarWebhook');
        return response.data;
    }

    async updateWebhook(id: string, newUrl: string): Promise<any> {
        const response = await taxiMachineApi.put(`/api/integracao/atualizarWebhook/${id}`, {
            url: newUrl
        });
        return response.data;
    }

    async deleteWebhook(id: string): Promise<any> {
        const response = await taxiMachineApi.delete(`/api/integracao/deletarWebhook/${id}`);
        return response.data;
    }
}

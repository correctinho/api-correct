import { AxiosInstance } from 'axios';
import qs from 'qs';
import {
    ChargeDetailsResult,
    IPixProvider,
    PixChargeCreationData,
    PixChargeCreationResult,
    PixDetailsResult,
    WebhookConfigurationResult,
} from '../../IPixProvider';
import { createSicrediAxiosClient } from '../../../../axios/sicredi-api';
import redisClient from '../../../../redis/redis.client';

export class SicrediPixProvider implements IPixProvider {
    private apiClient: AxiosInstance;
    private clientId: string;
    private clientSecret: string;
    private readonly REDIS_TOKEN_KEY = 'sicredi:pix:access_token';

    constructor() {
        this.clientId = process.env.SICREDI_CLIENT_ID!;
        this.clientSecret = process.env.SICREDI_CLIENT_SECRET!;
        this.apiClient = createSicrediAxiosClient();
    }

    public async getAccessToken(): Promise<string> {
        const cachedToken = await redisClient.get(this.REDIS_TOKEN_KEY);
        if (cachedToken) {
            return cachedToken;
        }

        return this.fetchAndCacheNewAccessToken();
    }
    private async fetchAndCacheNewAccessToken(): Promise<string> {
        try {
            console.log('SicrediPixProvider: Buscando novo token de acesso...');
            const credentials = Buffer.from(
                `${this.clientId}:${this.clientSecret}`
            ).toString('base64');
            const data = qs.stringify({
                grant_type: 'client_credentials',
                scope: 'cob.write cob.read webhook.write webhook.read',
            });

            const response = await this.apiClient.post('/oauth/token', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${credentials}`,
                },
            });

            const tokenData = response.data;
            const token = tokenData.access_token;
            const expiresInSeconds = tokenData.expires_in;

            // --- 4. Salvamos o novo token no Redis com um tempo de expiração ---
            // (Subtraímos 60s para ter uma margem de segurança)
            await redisClient.set(
                this.REDIS_TOKEN_KEY,
                token,
                'EX',
                expiresInSeconds - 60
            );

            console.log(
                'SicrediPixProvider: Novo token obtido e salvo no Redis.'
            );
            return token;
        } catch (error: any) {
            console.error(
                'ERRO CRÍTICO ao buscar token de acesso do Sicredi:',
                error.response?.data || error.message
            );
            throw new Error('Falha na autenticação com a API Pix Sicredi.');
        }
    }
    public async registerWebhook(
        pixKey: string,
        webhookUrl: string
    ): Promise<void> {
        // 1. Garante que temos um token de acesso válido
        const token = await this.getAccessToken();

        // 2. O endpoint usa a chave PIX, que precisa ser "URL encoded" para segurança
        const endpoint = `/api/v2/webhook/${encodeURIComponent(pixKey)}`;

        try {
            console.log(
                `Registrando webhook para a chave ${pixKey} na URL: ${webhookUrl}`
            );

            // 3. Faz a chamada PUT com a URL no corpo
            const response = await this.apiClient.put(
                endpoint,
                { webhookUrl }, // O corpo da requisição
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log(
                '✅ Webhook registrado/atualizado com sucesso!',
                response.data
            );
        } catch (error: any) {
            console.error(
                '❌ ERRO ao registrar webhook:',
                error.response?.data || error.message
            );
            throw new Error('Falha ao registrar webhook no Sicredi.');
        }
    }
    public async createImmediateCharge(
        chargeData: PixChargeCreationData
    ): Promise<PixChargeCreationResult> {
        const token = await this.getAccessToken();

        const expirationSeconds = chargeData.expiracaoSegundos || 3600;

        const requestBody = {
            calendario: { expiracao: expirationSeconds },
            devedor: {
                cpf: chargeData.cpf,
                nome: chargeData.nome,
            },
            valor: {
                original: chargeData.valor,
            },
            chave: chargeData.chave,
            solicitacaoPagador:
                chargeData.solicitacaoPagador || 'Pagamento via Syscorrect',
        };

        try {
            const response = await this.apiClient.post(
                `/api/v2/cob`,
                requestBody,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const bankCreatedAt = new Date(response.data.calendario.criacao); // Ex: 14:56:40
            const bankExpirationSeconds = response.data.calendario.expiracao; // Ex: 3600
            
            // Soma os segundos à data de criação
            const realExpirationDate = new Date(
                bankCreatedAt.getTime() + (bankExpirationSeconds * 1000)
            );
            // Retornamos os dados no formato do DTO genérico da interface
            return {
                txid: response.data.txid,
                pixCopiaECola: response.data.pixCopiaECola,
                expirationDate: realExpirationDate
            };
        } catch (error: any) {
            console.error(
                'ERRO ao criar cobrança PIX no Sicredi:',
                error.response?.data || error.message
            );
            throw new Error('Falha ao criar cobrança PIX no Sicredi.');
        }
    }

    public async getChargeByTxid(txid: string): Promise<ChargeDetailsResult> {
        const token = await this.getAccessToken();

        // O endpoint para consultar uma cobrança é /cob/{txid}
        const endpoint = `/api/v2/cob/${txid}`;

        console.log(`SicrediPixProvider: Consultando cobrança com txid: ${txid}`);

        try {
            const response = await this.apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // A resposta já corresponde à nossa interface ChargeDetailsResult
            return response.data;

        } catch (error: any) {
            console.error(
                '❌ ERRO ao consultar cobrança no Sicredi:',
                error.response?.data || error.message
            );

            if (error.response?.status === 404) {
                throw new Error('Cobrança não encontrada no Sicredi.');
            }
            
            throw new Error('Falha ao consultar cobrança no Sicredi.');
        }
    }

    public async getWebhookConfiguration(pixKey: string): Promise<WebhookConfigurationResult> {
        const token = await this.getAccessToken();

        const endpoint = `/api/v2/webhook/${pixKey}`;

        console.log(`SicrediPixProvider: Consultando webhook para a chave: ${pixKey}`);

        try {
            const response = await this.apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data;

        } catch (error: any) {
            console.error(
                '❌ ERRO ao consultar configuração de webhook no Sicredi:',
                error.response?.data || error.message
            );

            if (error.response?.status === 404) {
                throw new Error('Nenhum webhook configurado para esta chave Pix.');
            }
            
            throw new Error('Falha ao consultar configuração de webhook no Sicredi.');
        }
    }
}

// src/infra/providers/PixProvider/implementations/sicredi/MockPixProvider.ts
// (ou onde você decidir que ele deve estar, mas fora do __tests__ por enquanto)

import { ChargeDetailsResult, IPixProvider, PixChargeCreationData, PixChargeCreationResult, WebhookConfigurationResult } from "../../../IPixProvider";


export class SicrediMockPixProvider implements IPixProvider {
    // Estas propriedades podem ser setadas nos testes para controlar o retorno
    public createImmediateChargeResult: PixChargeCreationResult | Error = { 
        txid: `mocked-txid-${Date.now()}`, 
        pixCopiaECola: `mocked-pix-copia-e-cola` 
    };
    public getChargeByTxidResult: ChargeDetailsResult | Error = { 
        status: 'ATIVA', txid: 'mock-txid', valor: { original: '0.00' }, chave: 'mock-chave' 
    };
    public getWebhookConfigurationResult: WebhookConfigurationResult | Error = { 
        webhookUrl: 'mock-url', chave: 'mock-chave', criacao: new Date().toISOString() 
    };

    constructor() {
        // Não usamos jest.fn() aqui
    }

    async createImmediateCharge(chargeData: PixChargeCreationData): Promise<PixChargeCreationResult> {
        if (this.createImmediateChargeResult instanceof Error) {
            throw this.createImmediateChargeResult;
        }
        // Podemos adicionar alguma lógica básica se quisermos simular algo com base no input
        // Por exemplo, gerar um txid baseado em chargeData.valor
        const finalResult = { 
            ...this.createImmediateChargeResult, 
            txid: `mocked-txid-${chargeData.valor}-${Date.now()}` 
        };
        return Promise.resolve(finalResult);
    }

    async getChargeByTxid(txid: string): Promise<ChargeDetailsResult> {
        if (this.getChargeByTxidResult instanceof Error) {
            throw this.getChargeByTxidResult;
        }
        // Retorna o resultado configurado, ou um padrão se necessário
        const finalResult = { ...this.getChargeByTxidResult, txid: txid };
        return Promise.resolve(finalResult);
    }

    async getWebhookConfiguration(pixKey: string): Promise<WebhookConfigurationResult> {
        if (this.getWebhookConfigurationResult instanceof Error) {
            throw this.getWebhookConfigurationResult;
        }
        const finalResult = { ...this.getWebhookConfigurationResult, chave: pixKey };
        return Promise.resolve(finalResult);
    }
}
import { ChargeDetailsResult, IPixProvider, PixChargeCreationData, PixChargeCreationResult, WebhookConfigurationResult } from "../../IPixProvider";

export class SicrediMockPixProvider implements IPixProvider {
    // Para controlar o comportamento do mock em testes específicos
    // Use PixChargeCreationResult e PixChargeCreationData aqui
    public mockCreateImmediateCharge: jest.Mock<Promise<PixChargeCreationResult>, [PixChargeCreationData]>;

    constructor() {
        // Inicializa o mock com uma implementação padrão
        this.mockCreateImmediateCharge = jest.fn((data: PixChargeCreationData) => {
            // Retorna um resultado de PIX de teste
            return Promise.resolve({
                txid: `mocked-txid-${Date.now()}`,
                pixCopiaECola: `00020126360014BR.GOV.BCB.PIX0114${data.chave}5204000053039865802BR5915${data.nome}6007BRASIL62070503***6304CA12`,
            });
        });
    }

    async getChargeByTxid(txid: string): Promise<ChargeDetailsResult> {
        // Implemente um mock para este método também, se ele for usado em testes
        // ou lance um erro se você espera que ele não seja chamado.
        console.warn(`MockPixProvider: getChargeByTxid(${txid}) chamado, mas não implementado. Retornando mock padrão.`);
        return Promise.resolve({
            status: 'CONCLUIDA',
            txid: txid,
            valor: { original: '10.00' },
            chave: 'sua-chave-pix-mock',
            pix: [{
                endToEndId: 'mock-e2e-id',
                txid: txid,
                valor: '10.00',
                horario: new Date().toISOString(),
                chave: 'sua-chave-pix-mock',
                infoPagador: 'Pagador Teste',
            }]
        });
    }

    async getWebhookConfiguration(pixKey: string): Promise<WebhookConfigurationResult> {
        // Implemente um mock para este método também, se ele for usado em testes
        // ou lance um erro se você espera que ele não seja chamado.
        console.warn(`MockPixProvider: getWebhookConfiguration(${pixKey}) chamado, mas não implementado. Retornando mock padrão.`);
        return Promise.resolve({
            webhookUrl: `https://mock.webhook.com/${pixKey}`,
            chave: pixKey,
            criacao: new Date().toISOString(),
        });
    }

    async createImmediateCharge(chargeData: PixChargeCreationData): Promise<PixChargeCreationResult> {
        return this.mockCreateImmediateCharge(chargeData);
    }
}
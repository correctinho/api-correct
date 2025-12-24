// DTO genérico para os dados necessários para criar uma cobrança
export interface PixChargeCreationData {
    cpf: string;
    nome: string;
    valor: string; // Valor em formato string, ex: "10.50"
    chave: string; // A chave PIX que receberá o valor
    solicitacaoPagador?: string;
    expiracaoSegundos?: number
}

// DTO genérico para a resposta da criação de uma cobrança
export interface PixChargeCreationResult {
    txid: string;
    pixCopiaECola: string;
    expirationDate?: Date;
    // ... qualquer outro campo comum que seja retornado por provedores PIX
}

export interface ChargeDetailsResult {
    status: string; // Ex: "ATIVA" ou "CONCLUIDA"
    txid: string;
    valor: {
        original: string;
    };
    chave: string;
    // O campo 'pix' é opcional. Ele só existirá se a cobrança já foi paga.
    pix?: PixDetailsResult[]; 
}

export interface PixDetailsResult {
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string; // Timestamp da transação
    chave: string;
    infoPagador?: string;
    devolucoes?: Array<{
        id: string;
        rtrId: string;
        valor: string;
        status: string;
    }>;
}

export interface WebhookConfigurationResult {
    webhookUrl: string;
    chave: string;
    criacao: string; // Timestamp de criação
}

// A Interface (O Contrato)
export interface IPixProvider {
    /**
     * Cria uma cobrança PIX imediata.
     * @param chargeData Os dados para a criação da cobrança.
     * @returns Uma promessa que resolve com os detalhes da cobrança criada.
     */
    createImmediateCharge(chargeData: PixChargeCreationData): Promise<PixChargeCreationResult>;

    /**
     * Consulta os detalhes de um Pix recebido a partir do seu EndToEndId.
     * @param e2eId O EndToEndId da transação Pix.
     * @returns Uma promessa que resolve com os detalhes do Pix.
     */
    getChargeByTxid(txid: string): Promise<ChargeDetailsResult>;

     /**
     * Consulta a configuração de Webhook para uma chave Pix específica.
     * @param pixKey A chave Pix cuja configuração de webhook será consultada.
     * @returns Uma promessa que resolve com os detalhes da configuração do webhook.
     */
    getWebhookConfiguration(pixKey: string): Promise<WebhookConfigurationResult>;
    // No futuro, poderíamos adicionar outros métodos aqui, como:
    // getChargeStatus(txid: string): Promise<PixChargeStatus>;
}
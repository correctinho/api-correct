// DTO genérico para os dados necessários para criar uma cobrança
export interface PixChargeCreationData {
    cpf: string;
    nome: string;
    valor: string; // Valor em formato string, ex: "10.50"
    chave: string; // A chave PIX que receberá o valor
    solicitacaoPagador?: string;
}

// DTO genérico para a resposta da criação de uma cobrança
export interface PixChargeCreationResult {
    txid: string;
    pixCopiaECola: string;
    // ... qualquer outro campo comum que seja retornado por provedores PIX
}

// A Interface (O Contrato)
export interface IPixProvider {
    /**
     * Cria uma cobrança PIX imediata.
     * @param chargeData Os dados para a criação da cobrança.
     * @returns Uma promessa que resolve com os detalhes da cobrança criada.
     */
    createImmediateCharge(chargeData: PixChargeCreationData): Promise<PixChargeCreationResult>;

    // No futuro, poderíamos adicionar outros métodos aqui, como:
    // getChargeStatus(txid: string): Promise<PixChargeStatus>;
}
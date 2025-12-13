export class CurrencyConverter {
    /**
     * Converte um valor em Reais (BRL decimal) para Centavos (inteiro).
     * Ex: 150.50 -> 15050
     * Usa Math.round para corrigir imprecisões de ponto flutuante.
     */
    static toCents(amountInBrl: number): number {
        // Multiplica por 100 e arredonda para o inteiro mais próximo.
        return Math.round(amountInBrl * 100);
    }

    /**
     * Converte um valor em Centavos (inteiro) para Reais (BRL decimal).
     * Ex: 15050 -> 150.50
     * Útil para apresentar dados ao frontend.
     */
    static toBrl(amountInCents: number): number {
        return amountInCents / 100;
    }
}
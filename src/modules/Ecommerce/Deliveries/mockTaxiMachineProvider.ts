import { IDeliveryProvider, QuoteDeliveryInput, QuoteDeliveryOutput } from "./IDeliveryProvider";

export class MockTaxiMachineDeliveryProvider implements IDeliveryProvider {
    quoteDelivery(input: QuoteDeliveryInput): Promise<QuoteDeliveryOutput> {
        throw new Error("Method not implemented.");
    }
    async createDelivery(data: any): Promise<any> {
        // Simulando o delay de uma chamada de rede (ex: 300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));

        console.log("\n🚗 [SIMULAÇÃO TAXIMACHINE] - Chamada realizada com sucesso!");
        console.log(`📦 Ordem Vinculada: ${data.transactionUuid}`);
        console.log(`🏪 Origem (Loja): ${data.origin.address}`);
        console.log(`🏠 Destino (Cliente): ${data.destination.address}`);

        // Retorna um ID externo fictício para simular o id_mch da API deles
        return {
            external_delivery_id: `MOCK_TM_${Math.floor(Math.random() * 1000000)}`,
            status: "PENDING",
            estimated_minutes: 25,
            estimated_km: 4.2
        };
    }
}
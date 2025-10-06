import dotenv from 'dotenv';
import path from 'path';
import { SicrediPixProvider } from './sicredi-pix.provider';
import redisClient from '../../../../redis/redis.client';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function fetchChargeDetails() {
    // Pega o txid a partir do argumento da linha de comando
    const txid = process.argv[2];

    if (!txid) {
        console.error("ERRO: É necessário fornecer o txid da cobrança.");
        console.log("Uso: npx ts-node src/scripts/pix-details.ts <txid>");
        return;
    }

    console.log(`Buscando detalhes da cobrança com txid: ${txid}...`);

    try {
        const sicrediClient = new SicrediPixProvider();
        // Chama o novo método que busca por txid
        const chargeDetails = await sicrediClient.getChargeByTxid(txid);

        console.log("\n✅ Cobrança encontrada com sucesso! Detalhes abaixo:");
        console.log(JSON.stringify(chargeDetails, null, 2));

        // Verificação extra para informar se o pagamento foi localizado
        if (chargeDetails.pix && chargeDetails.pix.length > 0) {
            console.log("\n-> Pagamento (Pix) encontrado dentro da cobrança!");
        } else {
            console.log("\n-> Nenhum pagamento (Pix) associado a esta cobrança ainda.");
        }

    } catch (error: any) {
        console.error("\n❌ Falha ao buscar detalhes da cobrança:", error.message);
    } finally {
        await redisClient.quit();
    }
}

// Executa a função
fetchChargeDetails();
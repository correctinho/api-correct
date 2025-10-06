import dotenv from 'dotenv';
import path from 'path';
import redisClient from '../../../../redis/redis.client';
import { SicrediPixProvider } from './sicredi-pix.provider';

dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

async function testIntegration() {
    console.log("Iniciando teste de integração com Sicredi PIX...");
    try {
        const sicrediClient = new SicrediPixProvider();
        const tokenKey = 'sicredi:pix:access_token';
        
        // Verificamos se o token já existe no cache para saber se um novo será buscado
        const tokenExistsBefore = await redisClient.exists(tokenKey);

        const tokenValue = await sicrediClient.getAccessToken();

        console.log("\n✅ Teste de conexão/obtenção de token finalizado.");

        // 2. VISUALIZA o valor do token obtido.
        console.log(` -> Valor do token: ${tokenValue}`);

        console.log("\n✅ Token de Acesso obtido com sucesso!");

        if (!tokenExistsBefore) {
            console.log("   -> Um novo token foi buscado do Sicredi e salvo no Redis.");
        } else {
            console.log("   -> Token reutilizado do cache do Redis.");
        }

        // Verificação do TTL
        const ttl = await redisClient.ttl(tokenKey);
        console.log(`\n--- Verificando o Cache no Redis ---`);
        console.log(`Chave do token: ${tokenKey}`);
        console.log(`Tempo restante de vida (TTL) em segundos: ${ttl} (~${Math.round(ttl / 60)} minutos)`);
        
        // A verificação final e correta: apenas garante que o token existe no Redis e tem um TTL.
        if (ttl > 0) { 
            console.log("✅ GARANTIA: O token existe no Redis com um tempo de expiração definido.");
        } else {
            console.error("❌ ALERTA: O token não foi encontrado no Redis ou não tem expiração.");
        }
        console.log(`------------------------------------`);

        // ... (continuação com o teste de criação de cobrança)

    } catch (error) {
        console.error('\n❌ Falha no teste de integração:', error);
    } finally {
        redisClient.quit();
    }
}

testIntegration();
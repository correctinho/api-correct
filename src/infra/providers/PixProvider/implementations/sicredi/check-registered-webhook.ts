import dotenv from 'dotenv';
import path from 'path';
import { SicrediPixProvider } from './sicredi-pix.provider';
import redisClient from '../../../../redis/redis.client';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Função para verificar o webhook registrado para uma chave Pix fixa.
 */
async function checkWebhook() {
    // Chave Pix fixa para a verificação, conforme solicitado
    const pixKey = '62960b52-9f19-4c5e-8ce3-b9528fa848c4';

    console.log(`Iniciando verificação de webhook para a chave Pix: ${pixKey}`);

    try {
        const sicrediClient = new SicrediPixProvider();
        const webhookConfig = await sicrediClient.getWebhookConfiguration(pixKey);

        console.log("\n✅ Configuração de Webhook encontrada com sucesso:");
        console.log(JSON.stringify(webhookConfig, null, 2));

    } catch (error: any) {
        console.error("\n❌ Falha ao verificar o webhook:", error.message);
    } finally {
        // Encerra a conexão com o Redis para que o script termine corretamente
        await redisClient.quit();
    }
}

// Executa a função
checkWebhook();
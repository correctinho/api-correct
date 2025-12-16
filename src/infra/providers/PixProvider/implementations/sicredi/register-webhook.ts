import dotenv from 'dotenv';
import path from 'path';
import { SicrediPixProvider } from './sicredi-pix.provider';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, './.env') });

async function register() {
    try {
        const sicrediClient = new SicrediPixProvider();

        // Pega a chave PIX principal do seu .env
        const pixKey = process.env.SICREDI_PIX_KEY;
        if (!pixKey) {
            throw new Error("Variável SICREDI_PIX_KEY não encontrada no .env");
        }

        const ngrokUrl = "https://api.correct.com.br/webhooks/sicredi-pix";
        // return {status: 'ok', message: 'teste' }
        await sicrediClient.registerWebhook(pixKey, ngrokUrl);

    } catch (error) {
        console.error("Falha ao executar o script de registro de webhook.", error);
    }
}

register();
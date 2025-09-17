import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

// Garante que as variáveis de ambiente sejam carregadas
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    // Se a variável não estiver definida, o servidor não deve nem iniciar.
    // Isso previne erros difíceis de depurar em produção.
    throw new Error("Variável de ambiente REDIS_URL não está definida.");
}

// Cria uma única instância (singleton) do cliente Redis.
const redisClient = new Redis(redisUrl, {
    // Opções para reconexão automática em caso de falha
    maxRetriesPerRequest: 3, 
});

// Logs para nos ajudar a saber o status da conexão durante o desenvolvimento
redisClient.on('connect', () => {
    console.log('✅ Conectado ao Redis com sucesso!');
});

redisClient.on('error', (err:any) => {
    console.error('❌ Erro de Conexão com o Redis:', err);
});

// Exportamos a instância já pronta para ser usada em qualquer lugar.
export default redisClient;
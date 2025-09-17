import redisClient from "./redis.client";

async function testRedisConnection() {
    console.log('Iniciando teste de conexão com Redis...');
    try {
        await redisClient.set('chave-teste', 'meu-valor', 'EX', 10); // Salva uma chave por 10s
        const valor = await redisClient.get('chave-teste');
        console.log('Valor recuperado do Redis:', valor);

        if (valor === 'meu-valor') {
            console.log('\n✅ Conexão com Redis está funcionando perfeitamente!');
        } else {
            throw new Error('Valor recuperado é diferente do esperado.');
        }
    } catch (error) {
        console.error('\n❌ Falha na conexão com Redis:', error);
    } finally {
        // Fecha a conexão para o script poder terminar
        redisClient.quit();
    }
}

testRedisConnection();
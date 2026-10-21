const http = require('http');

async function run() {
    let txid = process.argv[2];
    let valorStr = "1.00";

    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        let transaction;
        
        if (!txid) {
            console.log("🔍 Nenhum txid informado. Buscando o último PIX pendente de recarga...");
            transaction = await prisma.transactions.findFirst({
                where: {
                    transaction_type: 'COMPANY_PRE_PAID_RECHARGE',
                    status: 'pending',
                    provider_tx_id: {
                        not: null
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            if (!transaction || !transaction.provider_tx_id) {
                console.error("❌ Nenhum pedido pendente com PIX foi encontrado no banco de dados.");
                process.exit(1);
            }
            txid = transaction.provider_tx_id;
            console.log(`🎯 Encontrado txid pendente mais recente: ${txid}`);
        } else {
            console.log(`🔍 Buscando valor esperado para o txid: ${txid}...`);
            transaction = await prisma.transactions.findFirst({
                where: { provider_tx_id: txid }
            });
        }

        if (transaction && transaction.net_price) {
            valorStr = (transaction.net_price / 100).toFixed(2);
            console.log(`💰 Valor configurado automaticamente: R$ ${valorStr}`);
        } else {
            console.log(`⚠️ Não foi possível achar a transação para pegar o valor exato. Usando valor padrão R$ ${valorStr}`);
        }

        await prisma.$disconnect();
    } catch (e) {
        console.error("❌ Erro ao buscar no banco via Prisma:", e.message);
        console.error("👉 O script tentará continuar com valor 1.00");
    }

    const payload = JSON.stringify({
        pix: [
            {
                endToEndId: "E" + Date.now() + "TESTSIMULATOR", // Fake E2E id
                txid: txid,
                valor: valorStr,
                chave: "chave-pix-fake",
                horario: new Date().toISOString()
            }
        ]
    });

    const options = {
        hostname: 'localhost',
        port: 3333,
        path: '/webhooks/sicredi-pix',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    console.log(`\n⏳ Simulando pagamento via Webhook para o txid: ${txid}...`);

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`✅ Status de Resposta: ${res.statusCode}`);
            console.log(`✅ Corpo da Resposta: ${data}`);
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Erro ao chamar o webhook local: ${e.message}`);
    });

    req.write(payload);
    req.end();
}

run();

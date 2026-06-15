import { Response, Request } from 'express';

// Usamos um Map para armazenar as conexões ativas, associando um ID de transação à resposta do Express.
const clients = new Map<string, Response>();

/**
 * Estabelece uma nova conexão SSE para um PDV que está ouvindo uma transação.
 */
export const sseSubscribe = (req: Request, res: Response) => {
    const { transactionId } = req.params;

    if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // Configura os headers essenciais para uma conexão SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Envia os headers imediatamente

    // Armazena a conexão do cliente
    clients.set(transactionId, res);
    console.log(`✅ PDV inscrito para a transação: ${transactionId}`);

    // Heartbeat para manter a conexão viva contra timeouts de Proxy/Rede
    const heartbeatInterval = setInterval(() => {
        // Envia um comentário SSE (iniciado com :), ignorado pelo frontend, mas mantém a rede ativa
        res.write(': keep-alive-ping\n\n');
    }, 15000); // 15 segundos

    // Quando o cliente fecha a conexão, removemos ele da nossa lista
    req.on('close', () => {
        clearInterval(heartbeatInterval);
        clients.delete(transactionId);
        console.log(`🔌 PDV desconectado da transação: ${transactionId}`);
    });
};

/**
 * Envia uma notificação de evento para um PDV específico.
 * @param transactionId O ID da transação para a qual a notificação se destina.
 * @param eventName O nome do evento (ex: 'paymentConfirmed').
 * @param data Os dados a serem enviados.
 */
export const sseSendEvent = (transactionId: string, eventName: string, data: object) => {
    const client = clients.get(transactionId);

    if (client) {
        // Formata a mensagem no padrão SSE: event: <nome>\ndata: <json>\n\n
        client.write(`event: ${eventName}\n`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
        console.log(`🚀 Evento '${eventName}' enviado para a transação: ${transactionId}`);
    }
};

export const sseDisconnect = (transactionId: string) => {
    const clientRes = clients.get(transactionId);

    if (clientRes) {
        console.log(`🔻 Encerrando conexão SSE pelo servidor para: ${transactionId}`);
        // Envia um evento final opcional (boa prática)
        clientRes.write(`event: connectionClosed\n`);
        clientRes.write(`data: {"reason": "transaction_terminal_state"}\n\n`);

        // O método .end() finaliza a resposta HTTP e fecha a conexão TCP subjacente.
        clientRes.end();

        // Removemos do mapa imediatamente. O 'req.on("close")' também dispararia,
        // mas é mais seguro garantir a remoção aqui.
        clients.delete(transactionId);
    }
};
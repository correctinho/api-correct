import { app } from "./app";
import http from 'http';
import { initWebSocket } from './websocket';
import 'dotenv/config';
// Logger removido

const port = process.env.PORT || 3333;

const httpServer = http.createServer(app);

try {
    initWebSocket(httpServer);
    // Substituído logger.info por console.log
    console.log('[Server] Inicialização do WebSocket concluída.');
} catch (error) {
    // Substituído logger.error por console.error
    console.error('[Server] Falha ao inicializar o WebSocket:', error);
    process.exit(1);
}

httpServer.listen(port, () => {
    // Substituído logger.info por console.log
    console.log(`[Server] Servidor HTTP e WebSocket rodando na PORTA ${port}`);
});

process.on('SIGTERM', () => {
    // Substituído logger.info por console.log
    console.log('[Server] Recebido SIGTERM. Fechando servidor http.');
    httpServer.close(() => {
        // Substituído logger.info por console.log
        console.log('[Server] Servidor http fechado.');
        process.exit(0);
    });
});

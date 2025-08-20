import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

/**
 * Inicializa o servidor Socket.IO, anexando-o ao servidor HTTP existente.
 * @param httpServer A instância do servidor HTTP do Node.js.
 */
export const initSocketServer = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // IMPORTANTE: Em produção, restrinja para o domínio do seu frontend PDV.
            methods: ["GET", "POST"]
        }
    });

    console.log('✅ Servidor WebSocket inicializado e pronto para conexões.');

    // Lógica principal que gerencia as conexões dos clientes (PDVs)
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Novo PDV conectado: ${socket.id}`);

        // Evento para o PDV se inscrever e "ouvir" uma transação específica
        socket.on('subscribeToTransaction', (transactionId: string) => {
            if (transactionId) {
                console.log(`PDV ${socket.id} está ouvindo a transação: ${transactionId}`);
                // Colocamos o socket em uma "sala" com o nome do ID da transação.
                // Isso nos permite enviar mensagens apenas para o PDV correto.
                socket.join(transactionId);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 PDV desconectado: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Exporta a instância global do 'io' para ser usada em outras partes do sistema (ex: Usecases).
 * @returns A instância do servidor Socket.IO.
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO não foi inicializado! O servidor HTTP precisa ser iniciado primeiro.");
    }
    return io;
};

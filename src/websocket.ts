import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
// Logger removido

let io: SocketIOServer;

const pdvConnections = new Map<string, string>();
const socketToPdv = new Map<string, string>();

export function initWebSocket(httpServer: http.Server): SocketIOServer {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket: Socket) => {
        // Substituído logger.info por console.log
        console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

        socket.on('registerPdv', (pdvId: string) => {
            if (!pdvId) {
                // Substituído logger.warn por console.warn
                console.warn(`[WebSocket] Tentativa de registro de PDV sem ID do socket ${socket.id}`);
                return;
            }
            // Substituído logger.info por console.log
            console.log(`[PDV Register] PDV ${pdvId} registrando com socket ${socket.id}`);

            const oldSocketId = pdvConnections.get(pdvId);
            if (oldSocketId && oldSocketId !== socket.id) {
                // Substituído logger.warn por console.warn
                console.warn(`[PDV Register] PDV ${pdvId} reconectando. Desconectando socket antigo ${oldSocketId}`);
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                if(oldSocket) {
                    oldSocket.disconnect(true);
                }
                socketToPdv.delete(oldSocketId);
            }

            pdvConnections.set(pdvId, socket.id);
            socketToPdv.set(socket.id, pdvId);
            socket.join(pdvId);

            // Substituído logger.info por console.log
            console.log(`[PDV Register] PDV ${pdvId} associado ao socket ${socket.id} e entrou na sala ${pdvId}`);
            socket.emit('pdvRegistered', { success: true, pdvId });
        });

        socket.on('disconnect', (reason: string) => {
            // Substituído logger.info por console.log
            console.log(`[WebSocket] Cliente desconectado: ${socket.id}. Razão: ${reason}`);
            const pdvId = socketToPdv.get(socket.id);
            if (pdvId) {
                if (pdvConnections.get(pdvId) === socket.id) {
                    pdvConnections.delete(pdvId);
                    // Substituído logger.info por console.log
                     console.log(`[PDV Disconnect] Mapeamento removido para PDV ${pdvId} (socket ${socket.id})`);
                } else {
                    // Substituído logger.info por console.log
                     console.log(`[PDV Disconnect] Socket ${socket.id} desconectou, mas não era o socket ativo para PDV ${pdvId}.`);
                }
                socketToPdv.delete(socket.id);
            }
        });
    });

    // Substituído logger.info por console.log
    console.log('[WebSocket] Servidor inicializado e escutando conexões.');
    return io;
}

export function getIO(): SocketIOServer {
    if (!io) {
        throw new Error("Socket.IO não foi inicializado!");
    }
    return io;
}

export function notifyPdv(pdvId: string, eventName: string, data: any) {
    const ioInstance = getIO();
    // Substituído logger.info por console.log
    // Usando JSON.stringify para ver melhor o objeto 'data' no log, se ele for complexo
    console.log(`[WebSocket Emit] Emitindo evento "${eventName}" para a sala PDV: ${pdvId}`, JSON.stringify(data));
    const socketsInRoom = ioInstance.sockets.adapter.rooms.get(pdvId);
    if (socketsInRoom && socketsInRoom.size > 0) {
        ioInstance.to(pdvId).emit(eventName, data);
         // Substituído logger.info por console.log
        console.log(`[WebSocket Emit] Evento "${eventName}" emitido com sucesso para a sala ${pdvId}.`);
    } else {
        // Substituído logger.warn por console.warn
        console.warn(`[WebSocket Emit] Nenhum cliente encontrado na sala PDV ${pdvId} para o evento "${eventName}". O PDV pode estar offline.`);
    }
}

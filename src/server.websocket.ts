import { app } from "./app";
import 'dotenv/config';
import http from 'http'; // 1. Importe o módulo http
import { initSocketServer } from './infra/websocket/socket.config'; // 2. Importe nosso inicializador

const port = process.env.port || 3333;

// 3. Crie um servidor HTTP a partir da sua instância do Express
const httpServer = http.createServer(app);

// 4. Inicialize o servidor WebSocket, "anexando-o" ao servidor HTTP
initSocketServer(httpServer);

// 5. Inicie o servidor HTTP (que agora também serve os WebSockets)
httpServer.listen(port, () => {
    console.log(`🚀 Servidor HTTP e WebSocket rodando na porta ${port}`);
});

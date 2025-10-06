import axios from 'axios';
import https from 'https';
import fs from 'fs'; 
import path from 'path';

export const createSicrediAxiosClient = () => {
    // 1. Leia os CAMINHOS das variáveis de ambiente
    const keyPath = process.env.SICREDI_PRIVATE_KEY;
    const certPath = process.env.SICREDI_CERT;
    const caPath = process.env.SICREDI_CA_CERT;

    // 2. Adicione verificações (boa prática)
    if (!keyPath) { throw new Error("SICREDI_PRIVATE_KEY não definido ou vazio."); } // Ajustei a mensagem aqui para refletir o nome da variável
    if (!certPath) { throw new Error("SICREDI_CERT não definido ou vazio."); }
    if (!caPath) { throw new Error("SICREDI_CA_CERT não definido ou vazio."); }

    // // --- ADICIONE ESTES CONSOLE.LOGS PARA VER O CAMINHO RESOLVIDO ---
    // const resolvedKeyPath = path.resolve(keyPath);
    // const resolvedCertPath = path.resolve(certPath);
    // const resolvedCaPath = path.resolve(caPath);

    // 3. Crie o Agente HTTPS, LENDO O CONTEÚDO de cada arquivo
    const httpsAgent = new https.Agent({
        key: keyPath,  
        cert: certPath,
        ca: caPath,
        rejectUnauthorized: false
    });

    // 4. Cria e retorna a instância do Axios
    return axios.create({
        baseURL: 'https://api-pix.sicredi.com.br',
        httpsAgent: httpsAgent,
    });
};
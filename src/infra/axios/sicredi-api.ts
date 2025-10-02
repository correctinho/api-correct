import axios from 'axios';
import https from 'https';
import fs from 'fs'; // <<< Importe o módulo 'fs'
import path from 'path'; // <<< Importe o módulo 'path'

export const createSicrediAxiosClient = () => {

    const projectRoot = path.resolve(__dirname, '../../..')
    // Usamos path.resolve para garantir que o caminho seja construído
    // a partir da raiz do projeto, independentemente de onde o script é executado.
    const keyPath = path.join(projectRoot, './src/infra/axios/certs', 'api-pix-jseren.key');
    const certPath = path.join(projectRoot, './src/infra/axios/certs', '32275282000126.cer');
    const caPath = path.join(projectRoot, './src/infra/axios/certs', 'CadeiaCompletaSicredi.cer');

    // const keyPath = path.resolve(process.env.SICREDI_PRIVATE_KEY_PATH!);
    // const certPath = path.resolve(process.env.SICREDI_CERT_PATH!);
    // const caPath = path.resolve(process.env.SICREDI_CA_CERT_PATH!);
    // 1. Configura o Agente HTTPS, lendo o CONTEÚDO de cada arquivo
    const httpsAgent = new https.Agent({
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: false
    });

    // 2. Cria e retorna a instância do Axios
    return axios.create({
        baseURL: 'https://api-pix.sicredi.com.br',
        httpsAgent: httpsAgent,
    });
};
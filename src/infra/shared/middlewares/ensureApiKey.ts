import { Request, Response, NextFunction } from "express";

export function ensureApiKey(request: Request, response: Response, next: NextFunction) {
    // Busca o header enviado pela aplicação externa
    const apiKeyHeader = request.headers['x-api-key'];
    // Busca a chave real configurada no seu .env
    const validApiKey = process.env.API_KEY;
    if (!apiKeyHeader) {
        return response.status(401).json({
            error: "Acesso negado. API Key não fornecida no header 'x-api-key'."
        });
    }

    if (apiKeyHeader !== validApiKey) {
        return response.status(401).json({
            error: "Acesso negado. API Key inválida."
        });
    }

    // Se a chave for válida, o fluxo segue normalmente para o Controller
    return next();
}

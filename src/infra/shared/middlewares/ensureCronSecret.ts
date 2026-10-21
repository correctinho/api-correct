import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/winston.logger";

export function ensureCronSecret(request: Request, response: Response, next: NextFunction) {
    const cronSecretHeader = request.headers['x-cron-secret'] as string | undefined;
    const authHeader = request.headers['authorization'] as string | undefined;
    const validCronSecret = process.env.CRON_SECRET;

    if (!validCronSecret) {
        logger.error("[CronAuth] Variavel de ambiente CRON_SECRET nao configurada no servidor.");
        return response.status(500).json({
            error: "Configuracao do servidor incompleta. CRON_SECRET nao definida no ambiente."
        });
    }

    // Aceita via header 'x-cron-secret' ou via 'Authorization: Bearer <secret>'
    const isSecretValid = 
        cronSecretHeader === validCronSecret || 
        authHeader === `Bearer ${validCronSecret}`;

    if (!isSecretValid) {
        logger.warn(`[CronAuth] Tentativa de acesso nao autorizada a endpoint de cron. IP: ${request.ip}`);
        return response.status(401).json({
            error: "Acesso negado. Chave de autenticacao invalida ou ausente no header 'x-cron-secret'."
        });
    }

    return next();
}

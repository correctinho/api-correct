import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../../errors/custom.error'; // Ajuste o caminho
import { logger } from '../../logger/winston.logger';

export const errorMiddleware = (
  error: Error & Partial<CustomError>,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.statusCode ? error.message : 'Erro interno do servidor.';

  // Pega o usuário e o Request ID para contexto
  const userId = (request as any).user?.uuid || (request as any).appUser?.user_info_uuid || 'anonymous';
  const requestId = (request as any).requestId;

  // Metadados para o log estruturado
  const logMeta = {
    statusCode,
    path: request.path,
    method: request.method,
    userId,
    requestId,
  };

  if (statusCode >= 500) {
    // ERRO CRÍTICO (500):
    // 1. O Sentry JÁ capturou isso no middleware dele (veremos no app.ts).
    // 2. Aqui nós logamos no stdout com Winston para ter o registro histórico e o stack trace nos logs da infra.
    logger.error(message, {
      ...logMeta,
      stack: error.stack, // Stack trace é importante aqui
    });
  } else {
    // ERRO OPERACIONAL (4xx):
    // Não enviamos para o Sentry (para não fazer barulho desnecessário).
    // Apenas logamos como aviso no Winston.
    logger.warn(message, logMeta);
  }

  // Resposta padronizada para o frontend
  return response.status(statusCode).json({
    status: 'error',
    message: message,
    // Em produção, é útil mandar o requestId para o usuário informar ao suporte.
    requestId: requestId 
  });
};
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Estende a tipagem do Request do Express para incluir o ID
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  // Retorna o ID no header para o frontend, útil para suporte
  res.setHeader('X-Request-ID', requestId);
  next();
};
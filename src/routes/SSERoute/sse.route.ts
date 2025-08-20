// No seu arquivo de rotas (ex: src/routes.ts)

import { Router } from 'express';
import { sseSubscribe } from '../../infra/sse/sse.config';

const sseRouter = Router()

sseRouter.get('/transactions/:transactionId/subscribe', sseSubscribe);

export { sseRouter }
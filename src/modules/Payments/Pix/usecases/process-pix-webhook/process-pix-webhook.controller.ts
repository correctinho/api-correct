import { Request, Response } from 'express';
import { ProcessPixWebhookUsecase } from './process-pix-webhook.usecase';

export class ProcessPixWebhookController {
    async handle(req: Request, res: Response) {
        try {
            const usecase = new ProcessPixWebhookUsecase();
            const result = await usecase.execute(req.body);

            return res.json(result);
        } catch (err: any) {
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

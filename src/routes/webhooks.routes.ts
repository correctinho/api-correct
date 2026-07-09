import { Router, Request, Response } from 'express';
import { ProcessTaxiMachineWebhookUseCase } from '../modules/Ecommerce/Deliveries/useCases/process-taximachine-webhook/process-taximachine-webhook.usecase';

const webhooksRoutes = Router();

webhooksRoutes.post('/taximachine', async (req: Request, res: Response) => {
    try {
        const token = req.query.token;

        // Validação de segurança obrigatória
        if (token !== process.env.TAXIMACHINE_WEBHOOK_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Em um ambiente de produção real, o UseCase deveria ser resolvido via Injeção de Dependência (tsyringe, etc)
        const processWebhookUseCase = new ProcessTaxiMachineWebhookUseCase();
        await processWebhookUseCase.execute(req.body);

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing TaxiMachine webhook:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export { webhooksRoutes };

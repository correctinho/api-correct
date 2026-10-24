import { Router, Request, Response } from 'express';
import { ProcessTaxiMachineWebhookUseCase } from '../modules/Ecommerce/Deliveries/useCases/process-taximachine-webhook/process-taximachine-webhook.usecase';
import { PrismaTicketsRepository } from '../modules/Support/Tickets/repositories/implementations/prisma-tickets.repository';
import { OneSignalPushNotificationProvider } from '../infra/providers/PushNotificationProvider/implementations/onesignal-push-notification.provider';
import { AxiosSlackProvider } from '../infra/providers/SlackProvider/implementations/axios-slack.provider';
import { HandleSlackWebhookUseCase } from '../modules/Support/Tickets/useCases/handle-slack-webhook/handle-slack-webhook.usecase';
import { HandleSlackWebhookController } from '../modules/Support/Tickets/useCases/handle-slack-webhook/handle-slack-webhook.controller';

const webhooksRoutes = Router();

// Webhook TaxiMachine
webhooksRoutes.post(['/taximachine', '/webhooks/taximachine'], async (req: Request, res: Response) => {
    try {
        const token = req.query.token;

        if (token !== process.env.TAXIMACHINE_WEBHOOK_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const processWebhookUseCase = new ProcessTaxiMachineWebhookUseCase();
        await processWebhookUseCase.execute(req.body);

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing TaxiMachine webhook:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook Slack Events API & Interactivity
const ticketsRepository = new PrismaTicketsRepository();
const pushNotificationProvider = new OneSignalPushNotificationProvider();
const slackProvider = new AxiosSlackProvider();
const handleSlackWebhookUseCase = new HandleSlackWebhookUseCase(ticketsRepository, pushNotificationProvider, slackProvider);
const handleSlackWebhookController = new HandleSlackWebhookController(handleSlackWebhookUseCase);

webhooksRoutes.post([
    '/webhooks/slack/events', 
    '/slack/events', 
    '/webhooks/slack/actions', 
    '/slack/actions', 
    '/webhooks/slack/interactivity',
    '/slack/interactivity'
], (req: Request, res: Response) => {
    return handleSlackWebhookController.handle(req, res);
});

export { webhooksRoutes };

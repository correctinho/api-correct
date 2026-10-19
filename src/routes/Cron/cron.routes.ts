import { Router, Request, Response } from 'express';
import { ensureCronSecret } from '../../infra/shared/middlewares/ensureCronSecret';
import { expireSubscriptionsJob, processGracePeriodJob } from '../../modules/CronJobs/Subscriptions';
import { generateEmployerInvoicesJob } from '../../modules/CronJobs/Invoices/GenerateInvoicesJob';
import { logger } from '../../infra/logger/winston.logger';

const cronRouter = Router();

// Aplica autenticação por chave secreta em todas as rotas de cron
cronRouter.use('/cron', ensureCronSecret);

// 1. Job: Expirar assinaturas vencidas de usuários do app
cronRouter.post('/cron/subscriptions/expire', async (req: Request, res: Response) => {
    const startTime = Date.now();
    logger.info('[HTTP Cron] Disparando ExpireSubscriptionsJob...');

    try {
        await expireSubscriptionsJob.execute();
        const duration = Date.now() - startTime;
        logger.info(`[HTTP Cron] ✅ ExpireSubscriptionsJob concluído em ${duration}ms`);

        return res.status(200).json({
            success: true,
            job: expireSubscriptionsJob.name,
            duration_ms: duration,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error(`[HTTP Cron] ❌ Erro ao executar ${expireSubscriptionsJob.name}:`, error);
        return res.status(500).json({
            success: false,
            job: expireSubscriptionsJob.name,
            error: error?.message || 'Erro interno ao executar ExpireSubscriptionsJob',
            timestamp: new Date().toISOString()
        });
    }
});

// 2. Job: Processar cancelamentos agendados de UserItems (Fim de Ciclo / Grace Period)
cronRouter.post('/cron/subscriptions/grace-period', async (req: Request, res: Response) => {
    const startTime = Date.now();
    logger.info('[HTTP Cron] Disparando ProcessGracePeriodJob...');

    try {
        await processGracePeriodJob.execute();
        const duration = Date.now() - startTime;
        logger.info(`[HTTP Cron] ✅ ProcessGracePeriodJob concluído em ${duration}ms`);

        return res.status(200).json({
            success: true,
            job: processGracePeriodJob.name,
            duration_ms: duration,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error(`[HTTP Cron] ❌ Erro ao executar ${processGracePeriodJob.name}:`, error);
        return res.status(500).json({
            success: false,
            job: processGracePeriodJob.name,
            error: error?.message || 'Erro interno ao executar ProcessGracePeriodJob',
            timestamp: new Date().toISOString()
        });
    }
});

// 3. Job: Fechamento de faturas e rollover de ciclo pós-pago de empresas
cronRouter.post('/cron/invoices/generate', async (req: Request, res: Response) => {
    const startTime = Date.now();
    logger.info('[HTTP Cron] Disparando GenerateEmployerInvoicesJob...');

    try {
        await generateEmployerInvoicesJob.execute();
        const duration = Date.now() - startTime;
        logger.info(`[HTTP Cron] ✅ GenerateEmployerInvoicesJob concluído em ${duration}ms`);

        return res.status(200).json({
            success: true,
            job: generateEmployerInvoicesJob.name,
            duration_ms: duration,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error(`[HTTP Cron] ❌ Erro ao executar ${generateEmployerInvoicesJob.name}:`, error);
        return res.status(500).json({
            success: false,
            job: generateEmployerInvoicesJob.name,
            error: error?.message || 'Erro interno ao executar GenerateEmployerInvoicesJob',
            timestamp: new Date().toISOString()
        });
    }
});

// 4. Job de Lote Diário (Opcional - roda todos os jobs diários em sequência)
cronRouter.post('/cron/run-all-daily', async (req: Request, res: Response) => {
    const startTime = Date.now();
    logger.info('[HTTP Cron] Disparando lote diário de todos os jobs...');

    const results: Array<{ job: string; success: boolean; duration_ms: number; error?: string }> = [];

    // Job 1
    const t1 = Date.now();
    try {
        await expireSubscriptionsJob.execute();
        results.push({ job: expireSubscriptionsJob.name, success: true, duration_ms: Date.now() - t1 });
    } catch (err: any) {
        results.push({ job: expireSubscriptionsJob.name, success: false, duration_ms: Date.now() - t1, error: err?.message });
    }

    // Job 2
    const t2 = Date.now();
    try {
        await processGracePeriodJob.execute();
        results.push({ job: processGracePeriodJob.name, success: true, duration_ms: Date.now() - t2 });
    } catch (err: any) {
        results.push({ job: processGracePeriodJob.name, success: false, duration_ms: Date.now() - t2, error: err?.message });
    }

    // Job 3
    const t3 = Date.now();
    try {
        await generateEmployerInvoicesJob.execute();
        results.push({ job: generateEmployerInvoicesJob.name, success: true, duration_ms: Date.now() - t3 });
    } catch (err: any) {
        results.push({ job: generateEmployerInvoicesJob.name, success: false, duration_ms: Date.now() - t3, error: err?.message });
    }

    const totalDuration = Date.now() - startTime;
    const hasFailures = results.some(r => !r.success);

    return res.status(hasFailures ? 207 : 200).json({
        success: !hasFailures,
        total_duration_ms: totalDuration,
        results,
        timestamp: new Date().toISOString()
    });
});

export { cronRouter };

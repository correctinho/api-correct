import "./infra/sentry/sentry.config";

import { app } from "./app";
import 'dotenv/config';
import { logger } from "./infra/logger/winston.logger";
import { setupCronJobs } from "./infra/cron/cron.config";

const port = process.env.port || 3333;

app.listen(port, () => {
    logger.info(`Server running on PORT ${port} em ambiente ${process.env.NODE_ENV}`);

    if (process.env.ENABLE_NODE_CRON === 'true') {
        try {
            setupCronJobs();
            logger.info('✅ Cron jobs internos (node-cron) inicializados com sucesso.');
        } catch (error) {
            logger.error('❌ Falha crítica ao inicializar cron jobs:', error);
        }
    } else {
        logger.info('ℹ️ Cron jobs internos (node-cron) desativados. Execuções agendadas via HTTP (/cron/*) prontas.');
    }
});

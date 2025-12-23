import "./infra/sentry/sentry.config";

import { app } from "./app";
import 'dotenv/config'
import { logger } from "./infra/logger/winston.logger";
import { setupCronJobs } from "./infra/cron/cron.config";

const port = process.env.port || 3333
// app.listen(port, () => console.log(`Server running on PORT ${port}`))

app.listen(port, () => {
    // Use o logger profissional em vez de console.log
    logger.info(`Server running on PORT ${port} em ambiente ${process.env.NODE_ENV}`);

    // INICIA OS CRON JOBS APÓS O SERVIDOR SUBIR
    // Isso garante que o banco e outras dependências já estejam prontos.
    try {
        setupCronJobs();
        logger.info('✅ Cron jobs inicializados com sucesso.');
    } catch (error) {
        // Se der erro na configuração dos crons, loga como erro crítico,
        // mas não derruba o servidor HTTP.
        logger.error('❌ Falha crítica ao inicializar cron jobs:', error);
    }
});

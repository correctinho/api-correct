import "./infra/sentry/sentry.config";

import { app } from "./app";
import 'dotenv/config'
import { logger } from "./infra/logger/winston.logger";

const port = process.env.port || 3333
// app.listen(port, () => console.log(`Server running on PORT ${port}`))

app.listen(port, () => {
    // Use o logger profissional em vez de console.log
    logger.info(`Server running on PORT ${port} em ambiente ${process.env.NODE_ENV}`);
});

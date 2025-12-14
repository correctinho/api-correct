import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import 'dotenv/config';

const dsn = process.env.SENTRY_DSN;
if (!dsn) {
  console.error("❌ ERRO CRÍTICO: SENTRY_DSN não foi encontrado nas variáveis de ambiente.");
} else {
  console.log(`✅ Sentry DSN encontrado (começa com): ${dsn.substring(0, 15)}...`);
}
// Inicializa o Sentry o mais cedo possível
Sentry.init({
  dsn: dsn,
  //debug: true,
  environment: process.env.NODE_ENV, // 'production' ou 'development'
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Ajuste as taxas de amostragem conforme necessário para controlar custos em produção
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% em prod, 100% em dev
  profilesSampleRate: 1.0,
});

console.log("✅ Sentry inicializado.");
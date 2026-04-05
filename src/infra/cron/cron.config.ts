import { expireSubscriptionsJob } from '../../modules/CronJobs/Subscriptions';
import { generateEmployerInvoicesJob } from '../../modules/CronJobs/Invoices/GenerateInvoicesJob';
import { prismaClient } from '../databases/prisma.config';
import { CronManager } from './CronManager'; // Ajuste o caminho

// Importe as implementações concretas dos seus jobs

export function setupCronJobs(): void {
  // Se estiver em ambiente de teste, talvez queira pular os crons
  if (process.env.NODE_ENV === 'test') {
      console.log('[CronManager] Pulando inicialização de jobs em ambiente de teste.');
      return;
  }

  const cronManager = new CronManager();

  console.log('[CronManager] Configurando jobs agendados...');

  // --- REGISTRO DOS JOBS ---

  // Job 1: Expirar Assinaturas Vencidas de usúarios de aplicativo
  cronManager.registerJob(expireSubscriptionsJob);

  // Job 2: Geração de faturas para empregadores (Billing loop)
  cronManager.registerJob(generateEmployerInvoicesJob);
  // const sendEmailJob = new SendEmailJob(mailProvider);
  // cronManager.registerJob(sendEmailJob);

  // --- INÍCIO DO AGENDAMENTO ---
  cronManager.startAll();
}
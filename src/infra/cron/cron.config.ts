import { expireSubscriptionsJob } from '../../modules/CronJobs/Subscriptions';
import { ExpireSubscriptionsJob } from '../../modules/CronJobs/Subscriptions/ExpireSubscriptionsJob';
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

  // Job 2: Exemplo futuro...
  // const sendEmailJob = new SendEmailJob(mailProvider);
  // cronManager.registerJob(sendEmailJob);

  // --- INÍCIO DO AGENDAMENTO ---
  cronManager.startAll();
}
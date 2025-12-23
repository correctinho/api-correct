import cron from 'node-cron';
import { ICronJob } from './ICronJob';

export class CronManager {
  private jobs: ICronJob[] = [];

  /**
   * Registra um novo job na lista de execução.
   */
  registerJob(job: ICronJob): void {
    // Validação básica da string do cron
    if (!cron.validate(job.schedule)) {
      throw new Error(`CRON ERROR: Expressão inválida para o job '${job.name}': ${job.schedule}`);
    }
    this.jobs.push(job);
    console.log(`[CronManager] Job registrado: ${job.name} [${job.schedule}]`);
  }

  /**
   * Inicia o agendamento de todos os jobs registrados.
   * Deve ser chamado apenas uma vez na inicialização do servidor.
   */
  startAll(): void {
    console.log(`[CronManager] Iniciando ${this.jobs.length} jobs...`);

    this.jobs.forEach((job) => {
      cron.schedule(job.schedule, async () => {
        console.log(`[CronManager] ⏰ Executando job: ${job.name}...`);
        const startTime = Date.now();

        try {
          // Executa a lógica do job específico
          await job.execute();

          const duration = Date.now() - startTime;
          console.log(`[CronManager] ✅ Job finalizado: ${job.name} (Duração: ${duration}ms)`);
        } catch (error) {
          console.error(`[CronManager] ❌ Erro crítico ao executar job ${job.name}:`, error);
          // Aqui você poderia adicionar notificação para Slack/Sentry se falhar
        }
      });
    });
  }
}
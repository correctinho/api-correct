export interface ICronJob {
  /**
   * Nome identificador do Job (útil para logs)
   */
  name: string;

  /**
   * Expressão Cron que define a periodicidade.
   * Ex: '0 3 * * *' (Todo dia às 3am)
   * Ex: '*\/5 * * * *' (A cada 5 minutos)
   * Use https://crontab.guru/ para gerar.
   */
  schedule: string;

  /**
   * O método que contém a lógica de negócio a ser executada.
   */
  execute(): Promise<void>;
}
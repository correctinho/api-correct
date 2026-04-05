import { ICronJob } from '../../../infra/cron/ICronJob';
import { prismaClient } from '../../../infra/databases/prisma.config';

export class GenerateEmployerInvoicesJob implements ICronJob {
  name = 'GenerateEmployerInvoicesJob';
  schedule = '0 2 * * *';

  async execute(): Promise<void> {
    console.log(`[${this.name}] Iniciando job de geração de faturas...`);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDay = yesterday.getDate();

    const cycleEndDate = new Date(yesterday);
    cycleEndDate.setHours(23, 59, 59, 999);

    const cycleStartDate = new Date(yesterday);
    cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
    cycleStartDate.setHours(0, 0, 0, 0);

    const dueDate = new Date(yesterday);
    dueDate.setDate(dueDate.getDate() + 5);
    dueDate.setHours(23, 59, 59, 999);

    const referenceMonth = `${String(cycleEndDate.getMonth() + 1).padStart(2, '0')}/${cycleEndDate.getFullYear()}`;

    try {
      const employers = await prismaClient.businessInfo.findMany({
        where: {
          business_type: { in: ['empregador', 'empregador_comercio'] },
          EmployerItemDetails: {
            some: {
              cycle_end_day: yesterdayDay,
            },
          },
        },
      });

      console.log(`[${this.name}] Encontrados ${employers.length} empregadores com fechamento no dia ${yesterdayDay}.`);

      let generatedCount = 0;

      for (const employer of employers) {
        try {
          const aggregate = await prismaClient.transactions.aggregate({
            where: {
              payer_business_info_uuid: employer.uuid,
              status: 'success',
              created_at: {
                gte: cycleStartDate.toISOString(),
                lte: cycleEndDate.toISOString(),
              },
            },
            _sum: {
              original_price: true,
            },
          });

          const totalAmount = aggregate._sum.original_price ?? 0;

          await prismaClient.employerInvoice.create({
            data: {
              business_info_uuid: employer.uuid,
              reference_month: referenceMonth,
              cycle_start_date: cycleStartDate,
              cycle_end_date: cycleEndDate,
              due_date: dueDate,
              total_amount: totalAmount,
              status: 'PENDING',
            },
          });

          generatedCount++;
          console.log(`[${this.name}] Fatura gerada para ${employer.fantasy_name || employer.uuid} - Valor: ${totalAmount} (cents)`);
        } catch (error: any) {
          console.error(`[${this.name}] Falha ao gerar fatura para o empregador ${employer.uuid}:`, error.message);
        }
      }

      console.log(`[${this.name}] Finalizado. ${generatedCount} faturas criadas com sucesso.`);
    } catch (error: any) {
      console.error(`[${this.name}] Erro ao buscar empregadores:`, error.message);
    }
  }
}

export const generateEmployerInvoicesJob = new GenerateEmployerInvoicesJob();

import { ICronJob } from '../../../infra/cron/ICronJob';
import { prismaClient } from '../../../infra/databases/prisma.config';
import { PostpaidRolloverUsecase } from '../../Company/BusinessItemsDetails/usecases/BusinessPostPaidItemsManagement/postpaid-rollover/postpaid-rollover.usecase';
import { TransactionOrderPrismaRepository } from '../../Payments/Transactions/repositories/implementations/transaction-order-prisma.repository';
import { getPostpaidConsumptionUsecase } from '../../Company/BusinessItemsDetails/usecases/BusinessPostPaidItemsManagement/get-postpaid-consumption';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { subDays } from 'date-fns';

export class GenerateEmployerInvoicesJob implements ICronJob {
  name = 'GenerateEmployerInvoicesJob';
  // Executa diariamente às 06:00 UTC (02:00 em Campo Grande UTC-4, 03:00 em Brasília UTC-3)
  // Garantindo que a meia-noite já passou em todos os estados do Brasil
  schedule = '0 6 * * *';

  async execute(): Promise<void> {
    console.log(`[${this.name}] Iniciando job de fechamento de faturas e rollover de ciclo pós-pago...`);

    try {
      // Busca todas as configurações de benefícios pós-pago ativas
      const details = await prismaClient.employerItemDetails.findMany({
        where: {
          is_active: true,
          cycle_end_day: { not: null },
          cycle_start_day: { not: null },
          Item: {
            item_category: 'pos_pago'
          }
        },
        include: {
          BusinessInfo: true,
          Item: true
        }
      });

      console.log(`[${this.name}] Encontrados ${details.length} benefícios pós-pago ativos para verificação.`);

      let generatedCount = 0;
      let rolloverCount = 0;

      for (const detail of details) {
        try {
          const businessInfoUuid = detail.business_info_uuid;
          const cycleStartDay = detail.cycle_start_day!;
          const cycleEndDay = detail.cycle_end_day!;
          const timezone = (detail.BusinessInfo as any).timezone || 'America/Campo_Grande';

          // 1. Determina a data de "ontem" no fuso horário da empresa
          const nowInTimezone = toZonedTime(new Date(), timezone);
          const yesterdayInTimezone = subDays(nowInTimezone, 1);
          const yesterdayDay = yesterdayInTimezone.getDate();

          // Quantidade de dias no mês de ontem (para tratar meses com menos de 31 dias)
          const lastDayOfMonth = new Date(
            yesterdayInTimezone.getFullYear(),
            yesterdayInTimezone.getMonth() + 1,
            0
          ).getDate();

          const isLastDay = yesterdayDay === lastDayOfMonth;

          // Verifica se o ciclo encerrou ontem no fuso local:
          // Caso 1: O dia bate exatamente (ex: cycleEndDay = 4 e ontem foi dia 4)
          // Caso 2: Ontem foi o último dia do mês e o cycleEndDay configurado é >= ao último dia (ex: cycleEndDay = 31 em abril, que acaba no dia 30)
          const didCycleEndYesterday = (cycleEndDay === yesterdayDay) || (isLastDay && cycleEndDay >= yesterdayDay);

          if (!didCycleEndYesterday) {
            continue;
          }

          console.log(`[${this.name}] Processando fechamento de ciclo para ${detail.BusinessInfo.fantasy_name} (${detail.Item.name}) no timezone ${timezone}.`);

          // 2. Calcula as datas de início e fim no fuso horário da empresa
          const endYear = yesterdayInTimezone.getFullYear();
          const endMonth = yesterdayInTimezone.getMonth(); // 0 a 11

          let startYear = endYear;
          let startMonth = endMonth;

          if (cycleStartDay > cycleEndDay) {
            // Ciclo começou no mês anterior (ex: dia 05 a 04)
            const prevMonthDate = new Date(endYear, endMonth - 1, 1);
            startYear = prevMonthDate.getFullYear();
            startMonth = prevMonthDate.getMonth();
          }

          const lastDayOfStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
          const adjustedStartDay = Math.min(cycleStartDay, lastDayOfStartMonth);
          const adjustedEndDay = yesterdayDay; // O dia que efetivamente encerrou ontem

          const startLocalDate = new Date(startYear, startMonth, adjustedStartDay, 0, 0, 0, 0);
          const endLocalDate = new Date(endYear, endMonth, adjustedEndDay, 23, 59, 59, 999);

          const startZoned = toZonedTime(startLocalDate, timezone);
          const endZoned = toZonedTime(endLocalDate, timezone);

          const cycleStartDateIso = formatTz(startZoned, "yyyy-MM-dd'T'00:00:00.000XXX", { timeZone: timezone });
          const cycleEndDateIso = formatTz(endZoned, "yyyy-MM-dd'T'23:59:59.999XXX", { timeZone: timezone });

          // Vencimento da fatura: 5 dias após o fechamento
          const dueDate = new Date(yesterdayInTimezone);
          dueDate.setDate(dueDate.getDate() + 1);
          dueDate.setHours(23, 59, 59, 999);

          const referenceMonth = `${String(endMonth + 1).padStart(2, '0')}/${endYear}`;

          // 3. USA O MESMO USECASE EXATO QUE A TELA DO RH USA!
          const consumptionResult = await getPostpaidConsumptionUsecase.execute({
            employer_item_details_uuid: detail.uuid,
            business_info_uuid: businessInfoUuid,
            start_date: cycleStartDateIso,
            end_date: cycleEndDateIso
          });

          const totalAmountReais = consumptionResult.total_cycle_used;
          const totalAmountCents = Math.round(totalAmountReais * 100);

          // 4. Cria a fatura se houver consumo (evita duplicidade verificando se já existe fatura deste ciclo)
          const existingInvoice = await prismaClient.employerInvoice.findFirst({
            where: {
              business_info_uuid: businessInfoUuid,
              reference_month: referenceMonth,
              cycle_start_date: new Date(cycleStartDateIso),
            }
          });

          if (!existingInvoice && totalAmountCents > 0) {
            await prismaClient.employerInvoice.create({
              data: {
                business_info_uuid: businessInfoUuid,
                reference_month: referenceMonth,
                cycle_start_date: new Date(cycleStartDateIso),
                cycle_end_date: new Date(cycleEndDateIso),
                due_date: dueDate,
                total_amount: totalAmountCents,
                status: 'PENDING',
              },
            });
            generatedCount++;
            console.log(`[${this.name}] Fatura gerada para ${detail.BusinessInfo.fantasy_name} (Benefício: ${detail.Item.name}) - Total: R$ ${totalAmountReais.toFixed(2)} (${totalAmountCents} cents) via GetPostpaidConsumptionUsecase`);
          } else if (existingInvoice) {
            console.log(`[${this.name}] Fatura de ${referenceMonth} para ${detail.BusinessInfo.fantasy_name} já existe. Pulando criação.`);
          } else {
            console.log(`[${this.name}] Sem consumo no ciclo para ${detail.BusinessInfo.fantasy_name} (${detail.Item.name}).`);
          }

          // 5. RENOVAÇÃO DE LIMITE AUTOMÁTICA DOS COLABORADORES
          try {
            const txRepository = new TransactionOrderPrismaRepository();
            const rolloverUsecase = new PostpaidRolloverUsecase(txRepository);

            const rolloverResult = await rolloverUsecase.execute({
              employer_item_details_uuid: detail.uuid
            });

            if (rolloverResult.total_users_updated > 0) {
              rolloverCount++;
              console.log(`[${this.name}] Limites renovados para ${rolloverResult.total_users_updated} colaboradores da empresa ${detail.BusinessInfo.fantasy_name}.`);
            }
          } catch (rolloverErr: any) {
            console.error(`[${this.name}] Falha ao renovar limites do benefício ${detail.uuid}:`, rolloverErr.message);
          }

        } catch (error: any) {
          console.error(`[${this.name}] Falha ao processar benefício ${detail.uuid}:`, error.message);
        }
      }

      console.log(`[${this.name}] Finalizado. ${generatedCount} faturas criadas e ${rolloverCount} benefícios tiveram limites renovados.`);
    } catch (error: any) {
      console.error(`[${this.name}] Erro geral no Job:`, error.message);
    }
  }
}

export const generateEmployerInvoicesJob = new GenerateEmployerInvoicesJob();

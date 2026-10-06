import { ICronJob } from '../../../infra/cron/ICronJob';
import { prismaClient } from '../../../infra/databases/prisma.config';
import { PostpaidRolloverUsecase } from '../../Company/BusinessItemsDetails/usecases/BusinessPostPaidItemsManagement/postpaid-rollover/postpaid-rollover.usecase';
import { TransactionOrderPrismaRepository } from '../../Payments/Transactions/repositories/implementations/transaction-order-prisma.repository';

export class GenerateEmployerInvoicesJob implements ICronJob {
  name = 'GenerateEmployerInvoicesJob';
  schedule = '0 2 * * *';

  async execute(): Promise<void> {
    console.log(`[${this.name}] Iniciando job de geração de faturas...`);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDay = yesterday.getDate();

    try {
      // Busca todas as configurações de pós-pago ativas cujo ciclo encerrou ontem
      const details = await prismaClient.employerItemDetails.findMany({
        where: {
          cycle_end_day: yesterdayDay,
          is_active: true,
          Item: {
            item_category: 'pos_pago'
          }
        },
        include: {
          BusinessInfo: true,
          Item: true
        }
      });

      console.log(`[${this.name}] Encontrados ${details.length} benefícios pós-pago com fechamento no dia ${yesterdayDay}.`);

      let generatedCount = 0;
      let rolloverCount = 0;

      for (const detail of details) {
        try {
          const businessInfoUuid = detail.business_info_uuid;
          const itemUuid = detail.item_uuid;
          const cycleStartDay = detail.cycle_start_day;
          
          if (!cycleStartDay) continue;

          // Cálculo correto das datas do ciclo
          const cycleEndDate = new Date(yesterday);
          cycleEndDate.setHours(23, 59, 59, 999);

          const cycleStartDate = new Date(yesterday);
          if (cycleStartDay <= yesterdayDay) {
            // Ciclo começou e terminou no mesmo mês (ex: dia 1 a 30)
            cycleStartDate.setDate(cycleStartDay);
          } else {
            // Ciclo começou no mês anterior (ex: dia 20 a 19)
            cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
            cycleStartDate.setDate(cycleStartDay);
          }
          cycleStartDate.setHours(0, 0, 0, 0);

          const dueDate = new Date(yesterday);
          dueDate.setDate(dueDate.getDate() + 5);
          dueDate.setHours(23, 59, 59, 999);

          const referenceMonth = `${String(cycleEndDate.getMonth() + 1).padStart(2, '0')}/${cycleEndDate.getFullYear()}`;

          // Agrega as transações usando a MESMA LÓGICA do relatório de consumo do RH (UserItem) e net_price
          const aggregate = await prismaClient.transactions.aggregate({
            where: {
              status: 'success',
              created_at: {
                gte: cycleStartDate.toISOString(),
                lte: cycleEndDate.toISOString(),
              },
              UserItem: {
                business_info_uuid: businessInfoUuid,
                item_uuid: itemUuid
              }
            },
            _sum: {
              net_price: true, // Usa o valor real gasto
            },
          });

          const totalAmount = aggregate._sum.net_price ?? 0;

          // Só gera fatura se teve algum consumo no mês
          if (totalAmount > 0) {
            await prismaClient.employerInvoice.create({
              data: {
                business_info_uuid: businessInfoUuid,
                reference_month: referenceMonth,
                cycle_start_date: cycleStartDate,
                cycle_end_date: cycleEndDate,
                due_date: dueDate,
                total_amount: totalAmount,
                status: 'PENDING',
              },
            });
            generatedCount++;
            console.log(`[${this.name}] Fatura gerada para ${detail.BusinessInfo.fantasy_name} (Benefício: ${detail.Item.name}) - Valor: ${totalAmount} (cents)`);
          } else {
            console.log(`[${this.name}] Sem consumo para ${detail.BusinessInfo.fantasy_name} (Benefício: ${detail.Item.name}). Nenhuma fatura gerada.`);
          }

          // RENOVAÇÃO DE LIMITE AUTOMÁTICA
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
          console.error(`[${this.name}] Falha ao processar fatura para o benefício ${detail.uuid}:`, error.message);
        }
      }

      console.log(`[${this.name}] Finalizado. ${generatedCount} faturas criadas e ${rolloverCount} empresas tiveram limites renovados.`);
    } catch (error: any) {
      console.error(`[${this.name}] Erro geral no Job:`, error.message);
    }
  }
}

export const generateEmployerInvoicesJob = new GenerateEmployerInvoicesJob();

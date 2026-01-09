import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { DailyMetricResult, DashboardAggregateResult, IPartnerDashboardRepository } from "../partner-dashboard.repository";
import { newDateF } from "../../../../../utils/date";
import { TransactionEntity, TransactionProps } from "../../../../Payments/Transactions/entities/transaction-order.entity";


export class PartnerDashboardPrismaRepository implements IPartnerDashboardRepository {

  async getAggregateMetrics(
    businessInfoUuid: string,
    startDate: Date,
    endDate: Date
  ): Promise<DashboardAggregateResult> {
    const aggregation = await prismaClient.transactions.aggregate({
      _sum: {
        net_price: true, // Usamos net_price pois é o valor efetivamente pago pelo usuário
      },
      _count: {
        uuid: true,
      },
      where: {
        favored_business_info_uuid: businessInfoUuid,
        status: 'success', // Apenas vendas confirmadas
        created_at: {
          gte: newDateF(startDate),
          lte: newDateF(endDate),
        },
      },
    });

    return {
      totalRevenue: Number(aggregation._sum.net_price || 0),
      transactionCount: aggregation._count.uuid || 0,
    };
  }

  async getDailyRevenue(
    businessInfoUuid: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyMetricResult[]> {
    // 1. Busca os dados brutos ordenados
    const transactions = await prismaClient.transactions.findMany({
      where: {
        favored_business_info_uuid: businessInfoUuid,
        status: 'success',
        created_at: {
          gte: newDateF(startDate),
          lte: newDateF(endDate),
        },
      },
      select: {
        created_at: true,
        net_price: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // 2. Agrupamento seguro (Map)
    const revenueMap = new Map<string, number>();

    transactions.forEach((tx) => {
      // CORREÇÃO: "Castamos" para unknown para o TypeScript permitir a checagem
      const rawDate = tx.created_at as unknown;

      const dateString = rawDate instanceof Date 
          ? rawDate.toISOString() 
          : String(rawDate);

      // Agora é seguro fazer o split
      const dateKey = dateString.split('T')[0]; 
      
      const currentAmount = revenueMap.get(dateKey) || 0;
      revenueMap.set(dateKey, currentAmount + Number(tx.net_price));
    });

    // 3. Formata para o retorno
    const results: DailyMetricResult[] = Array.from(revenueMap.entries()).map(
      ([date, amount]) => ({
        date,
        amount,
      })
    );

    return results;
  }

  async findRecentTransactions(
    businessInfoUuid: string,
    limit: number
  ): Promise<TransactionEntity[]> {
    const transactionsData = await prismaClient.transactions.findMany({
      where: {
        favored_business_info_uuid: businessInfoUuid,
        status: 'success',
      },
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        // Incluímos UserInfo para mostrar o nome de quem pagou no Dashboard, se necessário
        UserItem: {
          include: {
            UserInfo: true
          }
        }
      }
    });

    // Mapeia os resultados do Prisma para a Entidade de Domínio
    return transactionsData.map((data) => {
      const props: TransactionProps = {
        uuid: new Uuid(data.uuid),
        user_item_uuid: data.user_item_uuid ? new Uuid(data.user_item_uuid) : null,
        favored_user_uuid: data.favored_user_uuid ? new Uuid(data.favored_user_uuid) : null,
        favored_business_info_uuid: data.favored_business_info_uuid ? new Uuid(data.favored_business_info_uuid) : null,
        original_price: Number(data.original_price),
        net_price: Number(data.net_price),
        discount_percentage: Number(data.discount_percentage),
        fee_percentage: Number(data.fee_percentage),
        fee_amount: Number(data.fee_amount),
        partner_credit_amount: Number(data.partner_credit_amount),
        platform_net_fee_amount: Number(data.platform_net_fee_amount),
        cashback: Number(data.cashback),
        description: data.description,
        status: data.status,
        transaction_type: data.transaction_type,
        provider_tx_id: data.provider_tx_id,
        pix_e2e_id: data.pix_e2e_id,
        paid_at: data.paid_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        subscription_uuid: data.subscription_uuid ? new Uuid(data.subscription_uuid) : null,
        used_offline_token_code: data.used_offline_token_code,
        favored_partner_user_uuid: data.favored_partner_user_uuid ? new Uuid(data.favored_partner_user_uuid) : null,
      };

      // Como o UserInfo veio no include, podemos injetar ele na entidade se houver suporte
      // Mas para manter a integridade do Hydrate padrão, retornamos a entidade pura:
      return TransactionEntity.hydrate(props);
    });
  }
}
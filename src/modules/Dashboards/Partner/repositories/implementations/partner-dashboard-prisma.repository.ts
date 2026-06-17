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

  async getOperatorRanking(
    businessInfoUuid: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ name: string; amount: number; count: number }[]> {
    // Agrupa as transações pelo UUID do parceiro operador
    const transactions = await prismaClient.transactions.groupBy({
      by: ['favored_partner_user_uuid'],
      where: {
        favored_business_info_uuid: businessInfoUuid,
        status: 'success',
        created_at: {
          gte: newDateF(startDate),
          lte: newDateF(endDate),
        },
      },
      _sum: { net_price: true },
      _count: { uuid: true },
      orderBy: {
        _sum: { net_price: 'desc' },
      },
      take: 5, // Traz apenas o Top 5 vendedores
    });

    // Busca os nomes desses operadores na tabela BusinessUser
    const operatorIds = transactions
      .map((t) => t.favored_partner_user_uuid)
      .filter(Boolean) as string[];

    const operators = await prismaClient.businessUser.findMany({
      where: { uuid: { in: operatorIds } },
      select: { uuid: true, name: true, user_name: true },
    });

    // Monta o resultado combinando a soma com os nomes
    return transactions.map((t) => {
      const operator = operators.find((op) => op.uuid === t.favored_partner_user_uuid);
      const displayName = operator?.name || operator?.user_name || 'Caixa / Avulso';

      return {
        name: displayName,
        amount: Number(t._sum.net_price || 0),
        count: t._count.uuid,
      };
    });
  }


  async findRecentTransactions(
    businessInfoUuid: string,
    limit: number
  ): Promise<{ entity: TransactionEntity; payerName: string; operatorName: string }[]> {
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
        // Inclui o usuário pagador
        UserItem: {
          include: { UserInfo: true },
        },
        // NOVO: Inclui o operador que fez a venda (BusinessUser)
        PartnerUser: {
          select: { name: true, user_name: true }
        }
      },
    });

    // Retorna a entidade junto com os dados de apresentação
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

      const entity = TransactionEntity.hydrate(props);

      // Extraímos os nomes com fallbacks caso sejam nulos
      const payerName = data.UserItem?.UserInfo?.full_name || data.UserItem?.UserInfo?.display_name || 'Cliente Avulso';
      const operatorName = data.PartnerUser?.name || data.PartnerUser?.user_name || 'Caixa / Avulso';

      return { entity, payerName, operatorName };
    });
  }
}
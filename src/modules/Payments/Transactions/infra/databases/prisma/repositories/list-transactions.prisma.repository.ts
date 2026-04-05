import { prismaClient } from '../../../../../../../infra/databases/prisma.config';
import { IListTransactionsRepository } from '../../../../domain/repositories/list-transactions.repository.interface';
import { InputListTransactionsDto } from '../../../../application/usecases/dto/list-transactions.dto';

export class ListTransactionsPrismaRepository implements IListTransactionsRepository {
  async findAllPaginated(filters: InputListTransactionsDto): Promise<{ transactions: any[], total: number, total_platform_fee_cents: number }> {
    const { page = 1, limit = 20, status, start_date, end_date, search } = filters;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        let dateFilter = start_date instanceof Date ? start_date.toISOString() : start_date;
        where.created_at.gte = dateFilter;
      }
      if (end_date) {
        let dateFilter = end_date instanceof Date ? end_date.toISOString() : end_date;
        if (typeof end_date === 'string' && end_date.length === 10) {
            dateFilter = `${end_date}T23:59:59.999Z`;
        }
        where.created_at.lte = dateFilter;
      }
    }

    if (search && search.trim() !== '') {
      where.uuid = { contains: search };
    }

    const [transactions, total, aggregate] = await Promise.all([
      prismaClient.transactions.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          BusinessInfo: {
            select: {
              fantasy_name: true,
            }
          }
        }
      }),
      prismaClient.transactions.count({ where }),
      prismaClient.transactions.aggregate({
        where,
        _sum: {
          platform_net_fee_amount: true,
        }
      }),
    ]);

    const total_platform_fee_cents = aggregate._sum.platform_net_fee_amount ?? 0;

    return { transactions, total, total_platform_fee_cents };
  }
}

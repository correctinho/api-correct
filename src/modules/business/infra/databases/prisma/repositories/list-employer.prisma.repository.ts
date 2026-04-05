import { prismaClient } from '../../../../../../infra/databases/prisma.config';
import { IListEmployerRepository } from '../../../../domain/repositories/list-employer.repository.interface';
import { ListEmployerInputDto, ListEmployerOutputDto } from '../../../../application/usecases/dto/list-employer.dto';

export class ListEmployerPrismaRepository implements IListEmployerRepository {
  async findAllEmployers(data: ListEmployerInputDto): Promise<ListEmployerOutputDto> {
    const { status, search, page = 1, limit = 10 } = data;
    
    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {
      business_type: { in: ['empregador', 'empregador_comercio'] }
    };

    if (status) {
      where.status = status;
    }
    
    if (search) {
      const isDocument = search.replace(/\D/g, '').length > 0;
      
      where.OR = [
        {
          fantasy_name: {
            contains: search,
            mode: 'insensitive',
          }
        }
      ];

      if (isDocument) {
        where.OR.push({
          document: {
            contains: search.replace(/\D/g, ''),
          }
        });
      }
    }

    const [businessList, total] = await Promise.all([
      prismaClient.businessInfo.findMany({
        where,
        skip,
        take,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          uuid: true,
          fantasy_name: true,
          document: true,
          email: true,
          phone_1: true,
          status: true,
          created_at: true,
        },
      }),
      prismaClient.businessInfo.count({
        where,
      }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data: businessList as any,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}

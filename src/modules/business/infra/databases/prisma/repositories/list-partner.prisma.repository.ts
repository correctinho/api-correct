import { prismaClient } from '../../../../../../infra/databases/prisma.config';
import { IListPartnerRepository } from '../../../../domain/repositories/list-partner.repository.interface';
import { ListPartnerInputDto, ListPartnerOutputDto, PartnerEntity } from '../../../../application/usecases/dto/list-partner.dto';

export class ListPartnerPrismaRepository implements IListPartnerRepository {
  async list(data: ListPartnerInputDto): Promise<ListPartnerOutputDto> {
    const { status, document, page = 1, limit = 10 } = data;
    
    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {
      business_type: { not: 'empregador' }
    };

    if (status) {
      where.status = status;
    }
    if (document) {
      where.document = document.replace(/\D/g, '');
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
          business_type: true,
          created_at: true,
          _count: {
            select: { BusinessUser: true }
          }
        },
      }),
      prismaClient.businessInfo.count({
        where,
      }),
    ]);

    const lastPage = Math.ceil(total / limit);

    const formattedData = businessList.map((business: any) => {
      const { _count, ...rest } = business;
      return {
        ...rest,
        users_count: _count?.BusinessUser ?? 0,
      };
    });

    return {
      data: formattedData as unknown as PartnerEntity[],
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}

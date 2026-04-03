import { prismaClient } from '../../../../../../infra/databases/prisma.config';
import { IGetBusinessDetailRepository } from '../../../../domain/repositories/get-business-detail.repository.interface';
import { GetBusinessDetailInputDto, GetBusinessDetailOutputDto } from '../../../../application/usecases/dto/get-business-detail.dto';

export class GetBusinessDetailPrismaRepository implements IGetBusinessDetailRepository {
  async findById(data: GetBusinessDetailInputDto): Promise<GetBusinessDetailOutputDto | null> {
    const business = await prismaClient.businessInfo.findUnique({
      where: {
        uuid: data.uuid,
      },
      include: {
        Address: true,
        BusinessinfoBranch: {
          include: {
            BranchInfo: true,
          },
        },
        PartnerConfig: true,
        _count: {
          select: { BusinessUser: true }
        }
      },
    });

    if (!business) {
      return null;
    }

    const { _count, ...rest } = business as any;

    return {
      ...rest,
      users_count: _count?.BusinessUser ?? 0
    } as unknown as GetBusinessDetailOutputDto;
  }

  async findItemsNamesByUuids(uuids: string[]): Promise<string[]> {
    if (!uuids || uuids.length === 0) return [];

    const items = await prismaClient.item.findMany({
      where: {
        uuid: { in: uuids }
      },
      select: { name: true }
    });

    return items.map(item => item.name);
  }
}

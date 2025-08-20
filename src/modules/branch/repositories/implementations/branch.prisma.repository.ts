import { prismaClient } from '../../../../infra/databases/prisma.config';
import { BranchEntity, BranchProps } from '../../entities/branch.entity';
import { IBranchRepository } from '../branch.repository';
import { newDateF } from '../../../../utils/date';

export class BranchPrismaRepository implements IBranchRepository {

  async findByName(branch_name: string): Promise<BranchEntity | null> {
    const branch = await prismaClient.branchInfo.findFirst({
      where: {
        name: branch_name
      }
    })

    if (!branch) return null

    return branch as BranchEntity
  }
  async create(data: BranchEntity): Promise<BranchEntity> {
    const branchDataToSave = data.toJSON();
    const [branch, branchBenefit] = await prismaClient.$transaction([
      //create branch
      prismaClient.branchInfo.create({
        data: {
          uuid: branchDataToSave.uuid,
          name: branchDataToSave.name,
          marketing_tax: branchDataToSave.marketing_tax,
          market_place_tax: branchDataToSave.market_place_tax,
          admin_tax: branchDataToSave.admin_tax,
          created_at: newDateF(new Date()),
        },
      }),

      prismaClient.branchItem.createMany({
        data: data.benefits_uuid.map(itemUuid => ({
          branchInfo_uuid: branchDataToSave.uuid,
          item_uuid: itemUuid,
          created_at: newDateF(new Date())
        })),
      }),

    ])

    return branch as BranchEntity

  }
  async createMany(entities: BranchEntity[]): Promise<BranchEntity[]> {
    
    const transactionResult = await prismaClient.$transaction([
      // Criação em massa na tabela branchInfo
      prismaClient.branchInfo.createMany({
        data: entities.map(entity => ({
          uuid: entity.uuid,
          name: entity.name,
          marketing_tax: entity.marketing_tax,
          market_place_tax: entity.market_place_tax,
          admin_tax: entity.admin_tax,
          created_at: newDateF(new Date()),
          updated_at: newDateF(new Date()),
        })),
      }),

      // Criação em massa na tabela branchItem
      ...entities.map(entity =>
        prismaClient.branchItem.createMany({
          data: entity.benefits_uuid.map(itemUuid => ({
            branchInfo_uuid: entity.uuid,
            item_uuid: itemUuid,
            created_at: newDateF(new Date())
          })),
        })
      ),
    ]);

    // Como createMany não retorna as entidades, retornamos as entidades de entrada
    return entities;
  }

  async getByID(uuid: string): Promise<BranchEntity | null> {
    const branchData = await prismaClient.branchInfo.findUnique({
      where: { uuid: uuid },
      include: { BranchItem: { include: { Item: { select: { uuid: true, name: true } } } } }
    });

    if (!branchData) {
      return null;
    }

    const branchProps: BranchProps = {
      uuid: branchData.uuid,
      name: branchData.name,
      admin_tax: branchData.admin_tax,       // Passando o inteiro do banco (15000)
      marketing_tax: branchData.marketing_tax,
      market_place_tax: branchData.market_place_tax,
      benefits_name: branchData.BranchItem.map(r => r.Item.name),
      benefits_uuid: branchData.BranchItem.map(r => r.Item.uuid),
      created_at: branchData.created_at,
      updated_at: branchData.updated_at
    };

    // Agora chamamos o hydrate, que passa os dados direto para o construtor.
    return BranchEntity.hydrate(branchProps);
  }

  async update(uuid: string, data: BranchEntity): Promise<void> {
    const _r = await prismaClient.branchInfo.update({
      data: {
        name: data.name,
        marketing_tax: data.marketing_tax,
        market_place_tax: data.market_place_tax,
        admin_tax: data.admin_tax,
        updated_at: newDateF(new Date()),
      },
      where: { uuid: uuid },
    });
  }

  async list(): Promise<BranchEntity[] | []> {
    const r = await prismaClient.branchInfo.findMany();

    if (r.length > 0) {
      return r as BranchEntity[];
    }

    return [];
  }

  async getAvailableBranches(): Promise<BranchEntity[] | []> {
    const r = await prismaClient.branchInfo.findMany({
      where: {
        BusinessinfoBranch: { some: {} }
      }
    });

    if (r.length > 0) {
      return r as BranchEntity[]
    }

    return []
  }
  // async delete(uuid: string): Promise<void> {
  //     const _r = await prismaClient.branchInfo.delete({
  //         where: { uuid: uuid },
  //     });
  // }
}

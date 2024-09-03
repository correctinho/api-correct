import { prismaClient } from '../../../../infra/databases/prisma.config';
import { BenefitsEntity, BenefitsProps } from '../../entities/benefit.entity';
import { IBenefitsRepository } from '../benefit.repository';
import { newDateF } from '../../../../utils/date';
import { OutputGetBenefitsDTO } from '../../usecases/get-benefit-by-id/get-benefit.dto';
import { ItemCategory, ItemType } from '../../usecases/create-benefit/create-benefit.dto';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { BusinessItemsDetailsEntity } from '../../../Company/BusinessItemsDetails/entities/businessItemDetails.entity';

export class BenefitPrismaRepository implements IBenefitsRepository {
  async findByBusiness(business_info_uuid: string, item_name: string): Promise<BenefitsEntity | null> {
    const item = await prismaClient.item.findFirst({
      where:{
        name: item_name,
        business_info_uuid: business_info_uuid
      }
    })

    if(!item) return null

    return {
      uuid: new Uuid(item.uuid),
      name: item.name,
      description: item.description,
      item_type: item.item_type as ItemType,
      item_category: item.item_category as ItemCategory,
      parent_uuid: new Uuid(item.parent_uuid),
      created_at: item.created_at,
      updated_at: item.updated_at

    } as BenefitsEntity
  }

  async createCustomBenefit(benefit: BenefitsEntity, itemDetails: BusinessItemsDetailsEntity): Promise<void> {
   const [item, employer] = await prismaClient.$transaction([

      prismaClient.item.create({
        data: {
          uuid: benefit.uuid.uuid,
          name: benefit.name,
          description: benefit.description,
          item_type: benefit.item_type,
          item_category: benefit.item_category,
          parent_uuid: benefit.parent_uuid ? benefit.parent_uuid.uuid : null,
          business_info_uuid: benefit.business_info_uuid.uuid,
          created_at: benefit.created_at,
        },
      }),
      prismaClient.employerItemDetails.create({
        data:{
          uuid: itemDetails.uuid.uuid,
          item_uuid: itemDetails.item_uuid.uuid,
          business_info_uuid: itemDetails.business_info_uuid.uuid,
          cycle_end_day: itemDetails.cycle_end_day,
          cycle_start_day: itemDetails.cycle_start_day,
          created_at: itemDetails.created_at,
        }
      })
    ])
  }
  async findWithBranches(id: string): Promise<any[]> {
    const item = await prismaClient.branchItem.findMany({
      where:{
        item_uuid: id
      },
      select:{
        uuid: true,
        item_uuid: true,
        branchInfo_uuid: true,
        Item: true,
        Branch: true
      }
    })

    return item
  }

  async create(data: BenefitsEntity): Promise<void> {
    await prismaClient.item.create({
      data: {
        uuid: data.uuid.uuid,
        name: data.name,
        description: data.description,
        item_type: data.item_type,
        item_category: data.item_category,
        parent_uuid: data.parent_uuid ? data.parent_uuid.uuid : null,
        created_at: newDateF(new Date()),
      },
    });

  }

  async find(id: Uuid): Promise<BenefitsEntity | null> {

    const item = await prismaClient.item.findUnique({
      where: {
        uuid: id.uuid,
      }
    });

    if(!item) return null

    return {
      uuid: new Uuid(item.uuid),
      name: item.name,
      description: item.description,
      item_type: item.item_type as ItemType,
      item_category: item.item_category as ItemCategory,
      parent_uuid: new Uuid(item.parent_uuid),
      created_at: item.created_at,
      updated_at: item.updated_at

    } as BenefitsEntity


  }

  async findByName(name: string):Promise<BenefitsEntity | null> {
    const item = await prismaClient.item.findFirst({
      where: {
        name
      }
    });
    if(!item) return null

    return {
      uuid: new Uuid(item.uuid),
      name: item.name,
      description: item.description,
      item_type: item.item_type as ItemType,
      item_category: item.item_category as ItemCategory,
      parent_uuid: new Uuid(item.parent_uuid),
      created_at: item.created_at,
      updated_at: item.updated_at

    } as BenefitsEntity
  }



  async update(data: BenefitsEntity): Promise<void> {
    await prismaClient.item.update({
      where: {
        uuid: data.uuid.uuid as string
      },
      data: {
        name: data.name,
        description: data.description,
        item_type: data.item_type,
        item_category: data.item_category,
        parent_uuid: data.parent_uuid ? data.parent_uuid.uuid : null,
        business_info_uuid: data.business_info_uuid ? data.business_info_uuid.uuid : null,
        updated_at: newDateF(new Date()),
      }
    });
  }


  async findAll(): Promise<(BenefitsEntity)[]> {
    const r = await prismaClient.item.findMany();

    return r as BenefitsEntity[] | []
  }

}

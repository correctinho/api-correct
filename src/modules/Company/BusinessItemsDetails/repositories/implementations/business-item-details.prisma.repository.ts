import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { BenefitGroupsEntity } from "../../../BenefitGroups/entities/benefit-groups.entity";
import { BusinessItemsDetailsEntity } from "../../entities/businessItemDetails.entity";
import { OutputFindEmployerItemDetailsDTO } from "../../usecases/CorrectAdmin/findItemDetailsByCorrect/dto/find-employer-item.dto";
import { IBusinessItemDetailsRepository } from "../business-item-details.repository";
import { randomUUID } from 'crypto'

export class BusinessItemDetailsPrismaRepository implements IBusinessItemDetailsRepository {
  async findByIdWithItems(id: Uuid): Promise<OutputFindEmployerItemDetailsDTO | null> {
    const result = await prismaClient.employerItemDetails.findUnique({
      where: {
        uuid: id.uuid
      },
      select: {
        uuid: true,
        item_uuid: true,
        business_info_uuid: true,
        cycle_start_day: true,
        cycle_end_day: true,
        created_at: true,
        updated_at: true,
        Item: {
          select: {
            uuid: true,
            name: true,
            item_type: true,
            item_category: true,
            parent_uuid: true,
            business_info_uuid: true
          }
        }
      }
    })
    if (!result) return null

    return result as OutputFindEmployerItemDetailsDTO
  }

  async findByItemUuidAndBusinessInfo(businessInfoId: string, itemId: string): Promise<OutputFindEmployerItemDetailsDTO | null> {
    const result = await prismaClient.employerItemDetails.findFirst({
      where: {
        business_info_uuid: businessInfoId,
        item_uuid: itemId
      },
      select: {
        uuid: true,
        item_uuid: true,
        business_info_uuid: true,
        cycle_start_day: true,
        cycle_end_day: true,
        created_at: true,
        updated_at: true,
        Item: {
          select: {
            uuid: true,
            name: true,
            item_type: true,
            item_category: true,
            parent_uuid: true,
            business_info_uuid: true
          }
        },
        BenefitGroups: {
          select:{
            uuid: true,
            group_name: true,
            is_default: true,
            employer_item_details_uuid: true,
            value: true,
            business_info_uuid: true,
            created_at: true
          }
        }
      }
    })
    if (!result) return null

    return result as OutputFindEmployerItemDetailsDTO
  }
  async createOrUpdateItemAndGroup(itemEntity: BusinessItemsDetailsEntity, groupEntity: BenefitGroupsEntity) {
    const [employerItem, group] = await prismaClient.$transaction([
      prismaClient.employerItemDetails.upsert({
        where:{
          uuid: itemEntity.uuid.uuid
        },
        create: {
          uuid: itemEntity.uuid.uuid,
          item_uuid: itemEntity.item_uuid.uuid,
          business_info_uuid: itemEntity.business_info_uuid.uuid,
          cycle_end_day: itemEntity.cycle_end_day,
          cycle_start_day: itemEntity.cycle_start_day,
          is_active: itemEntity.is_active,
          created_at: itemEntity.created_at
        },
        update:{
          cycle_end_day: itemEntity.cycle_end_day,
          cycle_start_day: itemEntity.cycle_start_day,
          is_active: itemEntity.is_active,
          updated_at: itemEntity.updated_at
        }
      }),
      prismaClient.benefitGroups.upsert({
        where:{
          uuid: groupEntity.uuid.uuid
        },
        create: {
          uuid: groupEntity.uuid.uuid,
          group_name: groupEntity.group_name,
          employer_item_details_uuid: groupEntity.employer_item_details_uuid.uuid,
          value: groupEntity.value,
          business_info_uuid: groupEntity.business_info_uuid.uuid,
          is_default: groupEntity.is_default,
          created_at: groupEntity.created_at
        },
        update:{
          group_name: groupEntity.group_name,
          value: groupEntity.value,
          business_info_uuid: groupEntity.business_info_uuid.uuid,
          is_default: groupEntity.is_default,
          updated_at: groupEntity.updated_at
        }
      })

    ])

    return {
      employerItem: {
        uuid: employerItem.uuid,
        item_uuid: employerItem.item_uuid,
        business_info_uuid: employerItem.business_info_uuid,
        cycle_end_day: employerItem.cycle_end_day,
        cycle_start_day: employerItem.cycle_start_day,
        is_active: employerItem.is_active,
        created_at: employerItem.created_at,
        updated_at: employerItem.updated_at
      },
      defaultGroup: {
        uuid: group.uuid,
        group_name: group.group_name,
        employer_item_details_uuid: group.employer_item_details_uuid,
        value: group.value,
        business_info_uuid: group.business_info_uuid,
        is_default: group.is_default,
        created_at: group.created_at,
        updated_at: group.updated_at

      }

    }
  }

  async create(entity: BusinessItemsDetailsEntity): Promise<void> {
    await prismaClient.employerItemDetails.create({
      data: {
        uuid: entity.uuid.uuid,
        item_uuid: entity.item_uuid.uuid,
        business_info_uuid: entity.business_info_uuid.uuid,
        cycle_end_day: entity.cycle_end_day,
        cycle_start_day: entity.cycle_start_day,
        is_active: entity.is_active,
        created_at: entity.created_at
      }
    })
  }
  async update(entity: BusinessItemsDetailsEntity): Promise<void> {
    await prismaClient.employerItemDetails.update({
      where: {
        uuid: entity.uuid.uuid
      },
      data: {
        cycle_start_day: entity.cycle_start_day,
        cycle_end_day: entity.cycle_end_day,
        updated_at: entity.updated_at
      }
    })
  }
  async find(id: Uuid): Promise<BusinessItemsDetailsEntity | null> {
    const result = await prismaClient.employerItemDetails.findUnique({
      where: {
        uuid: id.uuid
      }
    })
    if (!result) return null
    return {
      uuid: new Uuid(result.uuid),
      item_uuid: new Uuid(result.item_uuid),
      business_info_uuid: new Uuid(result.business_info_uuid),
      cycle_start_day: result.cycle_start_day,
      cycle_end_day: result.cycle_end_day,
      created_at: result.created_at,
      updated_at: result.updated_at
    } as BusinessItemsDetailsEntity
  }
  async findAll(): Promise<BusinessItemsDetailsEntity[]> {
    const result = await prismaClient.employerItemDetails.findMany()

    return result as BusinessItemsDetailsEntity[] | []
  }

  async findAllEmployerItems(businessInfoId: string): Promise<OutputFindEmployerItemDetailsDTO[]> {
    const result = await prismaClient.employerItemDetails.findMany({
      where: { business_info_uuid: businessInfoId },
      select: {
        uuid: true,
        item_uuid: true,
        business_info_uuid: true,
        cycle_start_day: true,
        cycle_end_day: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        Item: true,
        BenefitGroups: true
      }
    })
    return result as OutputFindEmployerItemDetailsDTO[] | []

  }

}

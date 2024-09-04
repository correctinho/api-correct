import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { BusinessItemsDetailsEntity } from "../../entities/businessItemDetails.entity";
import { OutputFindEmployerItemDetailsDTO } from "../../usecases/AppUser/findItemDetailsByCorrect/dto/find-employer-item.dto";
import { IBusinessItemDetailsRepository } from "../business-item-details.repository";

export class BusinessItemDetailsPrismaRepository implements IBusinessItemDetailsRepository{

  async findByItemUuidAndBusinessInfo(businessInfoId: string, itemId: string): Promise<BusinessItemsDetailsEntity | null> {
    const result = await prismaClient.employerItemDetails.findFirst({
      where:{
        business_info_uuid: businessInfoId,
        item_uuid: itemId
      }
    })
    if(!result) return null

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
  async create(entity: BusinessItemsDetailsEntity): Promise<void> {
    await prismaClient.employerItemDetails.create({
      data:{
        uuid: entity.uuid.uuid,
        item_uuid: entity.item_uuid.uuid,
        business_info_uuid: entity.business_info_uuid.uuid,
        cycle_end_day: entity.cycle_end_day,
        cycle_start_day: entity.cycle_start_day,
        created_at: entity.created_at
      }
    })
  }
  async update(entity: BusinessItemsDetailsEntity): Promise<void> {
    await prismaClient.employerItemDetails.update({
      where:{
        uuid: entity.uuid.uuid
      },
      data:{
        cycle_start_day: entity.cycle_start_day,
        cycle_end_day: entity.cycle_end_day,
        updated_at: entity.updated_at
      }
    })
  }
  async find(id: Uuid): Promise<BusinessItemsDetailsEntity | null> {
    const result = await prismaClient.employerItemDetails.findUnique({
      where:{
        uuid: id.uuid
      }
    })
    if(!result) return null
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
      where:{ business_info_uuid: businessInfoId},
      select:{
        uuid: true,
        item_uuid: true,
        business_info_uuid: true,
        cycle_start_day: true,
        cycle_end_day: true,
        created_at: true,
        updated_at: true,
        Item:true
      }
    })
    return result as OutputFindEmployerItemDetailsDTO[] | []

  }

}

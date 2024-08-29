import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { BusinessItemsDetailsEntity } from "../../entities/businessItemDetails.entity";
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
  create(entity: BusinessItemsDetailsEntity): Promise<void> {
    throw new Error("Method not implemented.");
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

  async findAllEmployerItems(businessInfoId: string): Promise<BusinessItemsDetailsEntity[]> {
    const result = await prismaClient.employerItemDetails.findMany({
      where:{ business_info_uuid: businessInfoId}
    })
    return result as BusinessItemsDetailsEntity[] | []

  }

}

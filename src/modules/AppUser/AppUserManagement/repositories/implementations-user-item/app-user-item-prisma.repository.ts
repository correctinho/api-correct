import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { AppUserItemEntity } from "../../entities/app-user-item.entity";
import { OutputFindAllAppUserItemsDTO } from "../../usecases/UserItem/find-all-by-employer/dto/find-user-item.dto";
import { IAppUserItemRepository } from "../app-user-item-repository";

export class AppUserItemPrismaRepository implements IAppUserItemRepository {
  async findDebitUserItem(userInfoId: string): Promise<AppUserItemEntity | null> {
    const userItem = await prismaClient.userItem.findFirst({
      where: {
        item_name: "Correct",
        user_info_uuid: userInfoId,
      },
      include: {
        Item: true,
        BenefitGroups: true
      }
    })

    if (!userItem) return null
    return {
      uuid: new Uuid(userItem.uuid),
      business_info_uuid: new Uuid(userItem.business_info_uuid),
      user_info_uuid: new Uuid(userItem.user_info_uuid),
      item_uuid: new Uuid(userItem.item_uuid),
      item_type: userItem.Item.item_type,
      item_category: userItem.Item.item_category,
      img_url: userItem.Item.img_url,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at,
      cancelled_at: userItem.cancelled_at,
      block_reason: userItem.block_reason,
      cancel_reason: userItem.cancel_reason,
      cancelling_request_at: userItem.cancelling_request_at,
      grace_period_end_date: userItem.grace_period_end_date,
      group_uuid: new Uuid(userItem.BenefitGroups.uuid),
      group_name: userItem.BenefitGroups.group_name,
      group_value: userItem.BenefitGroups.value,
      group_is_default: userItem.BenefitGroups.is_default,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    } as AppUserItemEntity
  }

  async findByItemUuidAndUserInfo(userInfoId: string, itemId: string): Promise<AppUserItemEntity | null> {
    const userItem = await prismaClient.userItem.findFirst({
      where: {
        item_uuid: itemId,
        user_info_uuid: userInfoId,
      },
      include: {
        Item: true,
        BenefitGroups: true
      }
    })

    if (!userItem) return null
    return {
      uuid: new Uuid(userItem.uuid),
      business_info_uuid: new Uuid(userItem.business_info_uuid),
      user_info_uuid: new Uuid(userItem.user_info_uuid),
      item_uuid: new Uuid(userItem.item_uuid),
      item_type: userItem.Item.item_type,
      item_category: userItem.Item.item_category,
      img_url: userItem.Item.img_url,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at,
      cancelled_at: userItem.cancelled_at,
      block_reason: userItem.block_reason,
      cancel_reason: userItem.cancel_reason,
      cancelling_request_at: userItem.cancelling_request_at,
      grace_period_end_date: userItem.grace_period_end_date,
      group_uuid: new Uuid(userItem.BenefitGroups.uuid),
      group_name: userItem.BenefitGroups.group_name,
      group_value: userItem.BenefitGroups.value,
      group_is_default: userItem.BenefitGroups.is_default,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    } as AppUserItemEntity

  }

  async findItemByEmployeeAndBusiness(userInfoId: string, business_info_uuid: string, itemId: string): Promise<AppUserItemEntity | null> {
    const userItem = await prismaClient.userItem.findFirst({
      where: {
        business_info_uuid: business_info_uuid,
        user_info_uuid: userInfoId,
        item_uuid: itemId
      },
      include: {
        Item: true,
        BenefitGroups: true

      }
    })

    if (!userItem) return null
    return {
      uuid: new Uuid(userItem.uuid),
      business_info_uuid: new Uuid(userItem.business_info_uuid),
      user_info_uuid: new Uuid(userItem.user_info_uuid),
      item_uuid: new Uuid(userItem.item_uuid),
      item_type: userItem.Item.item_type,
      item_category: userItem.Item.item_category,
      img_url: userItem.Item.img_url,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at,
      cancelled_at: userItem.cancelled_at,
      block_reason: userItem.block_reason,
      cancel_reason: userItem.cancel_reason,
      cancelling_request_at: userItem.cancelling_request_at,
      grace_period_end_date: userItem.grace_period_end_date,
      group_uuid: userItem.BenefitGroups ? new Uuid(userItem.BenefitGroups.uuid) : null,
      group_name: userItem.BenefitGroups ? userItem.BenefitGroups.group_name : null,
      group_value: userItem.BenefitGroups ? userItem.BenefitGroups.value : null,
      group_is_default: userItem.BenefitGroups ? userItem.BenefitGroups.is_default : null,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    } as AppUserItemEntity
  }
  async create(entity: AppUserItemEntity): Promise<void> {
    await prismaClient.userItem.create({
      data: {
        uuid: entity.uuid.uuid,
        user_info_uuid: entity.user_info_uuid.uuid,
        business_info_uuid: entity.business_info_uuid.uuid,
        item_uuid: entity.item_uuid.uuid,
        item_name: entity.item_name,
        balance: entity.balance,
        group_uuid: entity.group_uuid.uuid,
        status: entity.status,
        blocked_at: entity.blocked_at,
        cancelled_at: entity.cancelled_at,
        block_reason: entity.block_reason,
        cancel_reason: entity.cancel_reason,
        grace_period_end_date: entity.grace_period_end_date,
        created_at: entity.created_at,
      }
    })
  }
  async update(entity: AppUserItemEntity): Promise<void> {
    await prismaClient.userItem.update({
      where: {
        uuid: entity.uuid.uuid
      },
      data: {
        uuid: entity.uuid.uuid,
        user_info_uuid: entity.user_info_uuid.uuid,
        item_uuid: entity.item_uuid.uuid,
        item_name: entity.item_name,
        balance: entity.balance,
        status: entity.status,
        blocked_at: entity.blocked_at,
        cancelled_at: entity.cancelled_at,
        block_reason: entity.block_reason,
        cancel_reason: entity.cancel_reason,
        cancelling_request_at: entity.cancelling_request_at,
        grace_period_end_date: entity.grace_period_end_date,
        updated_at: entity.updated_at,
      }
    })
  }
  async find(id: Uuid): Promise<AppUserItemEntity | null> {
    const userItem = await prismaClient.userItem.findUnique({
      where: {
        uuid: id.uuid,
      },
      include: {
        Item: true,
        BenefitGroups: true,
        Business: true
      }
    })

    if (!userItem) return null
    return {
      uuid: new Uuid(userItem.uuid),
      business_info_uuid: new Uuid(userItem.business_info_uuid),
      fantasy_name: userItem.Business ? userItem.Business.fantasy_name : null,
      user_info_uuid: new Uuid(userItem.user_info_uuid),
      item_uuid: new Uuid(userItem.item_uuid),
      item_type: userItem.Item.item_type,
      item_category: userItem.Item.item_category,
      img_url: userItem.Item.img_url,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status,
      blocked_at: userItem.blocked_at,
      cancelled_at: userItem.cancelled_at,
      block_reason: userItem.block_reason,
      cancel_reason: userItem.cancel_reason,
      cancelling_request_at: userItem.cancelling_request_at,
      grace_period_end_date: userItem.grace_period_end_date,
      group_uuid: userItem.BenefitGroups ? new Uuid(userItem.BenefitGroups.uuid) : null,
      group_name: userItem.BenefitGroups ? userItem.BenefitGroups.group_name : null,
      group_value: userItem.BenefitGroups ? userItem.BenefitGroups.value : null,
      group_is_default: userItem.BenefitGroups ? userItem.BenefitGroups.is_default : null,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at
    } as AppUserItemEntity
  }
  findAll(): Promise<AppUserItemEntity[]> {
    throw new Error("Method not implemented.");
  }

  async findAllUserItems(userInfoId: string): Promise<AppUserItemEntity[] | []> {
    const userItems = await prismaClient.userItem.findMany({
      where: {
        user_info_uuid: userInfoId
      },
      include: {
        Item: true,
        Business: {
          select: {
            uuid: true,
            fantasy_name: true
          }
        },
        BenefitGroups: true

      }
    })
    return userItems.map((userItem) => {
      return {
        uuid: new Uuid(userItem.uuid),
        business_info_uuid: userItem.Business ? new Uuid(userItem.Business.uuid) : null,
        fantasy_name: userItem.Business ? userItem.Business.fantasy_name : null,
        user_info_uuid: new Uuid(userItem.user_info_uuid),
        item_uuid: new Uuid(userItem.item_uuid),
        item_type: userItem.Item.item_type,
        item_category: userItem.Item.item_category,
        img_url: userItem.Item.img_url,
        item_name: userItem.item_name,
        balance: userItem.balance,
        status: userItem.status,
        blocked_at: userItem.blocked_at,
        cancelled_at: userItem.cancelled_at,
        block_reason: userItem.block_reason,
        cancel_reason: userItem.cancel_reason,
        cancelling_request_at: userItem.cancelling_request_at,
        grace_period_end_date: userItem.grace_period_end_date,
        group_uuid: userItem.BenefitGroups ? new Uuid(userItem.BenefitGroups.uuid) : null,
        group_name: userItem.BenefitGroups ? userItem.BenefitGroups.group_name : null,
        group_value: userItem.BenefitGroups ? userItem.BenefitGroups.value : null,
        group_is_default: userItem.BenefitGroups ? userItem.BenefitGroups.is_default : null,
        created_at: userItem.created_at,
        updated_at: userItem.updated_at
      }
    }) as AppUserItemEntity[] | []

  }

}

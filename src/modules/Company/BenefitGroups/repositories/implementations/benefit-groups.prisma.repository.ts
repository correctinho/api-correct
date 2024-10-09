import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { BenefitGroupsEntity } from "../../entities/benefit-groups.entity";
import { IBenefitGroupsRepository } from "../benefit-groups.repository";

export class BenefitGroupsPrismaRepository implements IBenefitGroupsRepository {
  async createReturn(data: BenefitGroupsEntity): Promise<BenefitGroupsEntity> {
    const group = await prismaClient.benefitGroups.create({
      data: {
        uuid: data.uuid.uuid,
        group_name: data.group_name,
        employerItemDetails_uuids: data.employerItemDetails_uuids,
        value: data.value,
        user_info_uuid: data.user_info_uuids,
        business_info_uuid: data.business_info_uuid.uuid,
        created_at: data.created_at
      }

    })

    return {
      uuid: new Uuid(group.uuid),
      group_name: group.group_name,
      employerItemDetails_uuids: group.employerItemDetails_uuids,
      value: group.value,
      user_info_uuids: group.user_info_uuid,
      business_info_uuid: new Uuid(group.business_info_uuid),
      created_at: group.created_at
    } as BenefitGroupsEntity
  }
  async findAllByBusiness(business_info_uuid: string): Promise<BenefitGroupsEntity[] | []> {
    const groups = await prismaClient.benefitGroups.findMany({
      where: {
        business_info_uuid: business_info_uuid
      }

    })
    if (!groups) return []

    const groupsArray = groups.map((group) => {
      return {
        uuid: new Uuid(group.uuid),
        group_name: group.group_name,
        employerItemDetails_uuids: group.employerItemDetails_uuids,
        value: group.value,
        user_info_uuids: group.user_info_uuid,
        business_info_uuid: new Uuid(group.business_info_uuid),
        created_at: group.created_at
      }
    })
    return groupsArray as BenefitGroupsEntity[]
  }
  async createOrUpdate(data: BenefitGroupsEntity): Promise<BenefitGroupsEntity> {
    const group = await prismaClient.benefitGroups.upsert({
      where: {
        uuid: data.uuid.uuid
      },
      create: {
        uuid: data.uuid.uuid,
        group_name: data.group_name,
        employerItemDetails_uuids: data.employerItemDetails_uuids,
        value: data.value,
        user_info_uuid: data.user_info_uuids,
        business_info_uuid: data.business_info_uuid.uuid,
        created_at: data.created_at
      },
      update: {
        group_name: data.group_name,
        employerItemDetails_uuids: data.employerItemDetails_uuids,
        value: data.value,
        user_info_uuid: data.user_info_uuids,
        business_info_uuid: data.business_info_uuid.uuid,
        //updated_at: data.updated_at
      }
    })

    return {
      uuid: new Uuid(group.uuid),
      group_name: group.group_name,
      employerItemDetails_uuids: group.employerItemDetails_uuids,
      value: group.value,
      user_info_uuids: group.user_info_uuid,
      business_info_uuid: new Uuid(group.business_info_uuid),
      created_at: group.created_at
    } as BenefitGroupsEntity
  }

  async create(entity: BenefitGroupsEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async update(entity: BenefitGroupsEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async find(id: Uuid): Promise<BenefitGroupsEntity | null> {
    const group = await prismaClient.benefitGroups.findUnique({
      where: {
        uuid: id.uuid
      }

    })
    if (!group) return null

    return {
      uuid: new Uuid(group.uuid),
      group_name: group.group_name,
      employerItemDetails_uuids: group.employerItemDetails_uuids,
      value: group.value,
      user_info_uuids: group.user_info_uuid,
      business_info_uuid: new Uuid(group.business_info_uuid),
      created_at: group.created_at
    } as BenefitGroupsEntity
  }
  async findAll(): Promise<BenefitGroupsEntity[]> {
    throw new Error("Method not implemented.");
  }

}

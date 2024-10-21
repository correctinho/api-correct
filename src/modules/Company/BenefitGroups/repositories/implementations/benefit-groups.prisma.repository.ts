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
        employer_item_details_uuid: data.employer_item_details_uuid.uuid,
        value: data.value,
        is_default: data.is_default,
        business_info_uuid: data.business_info_uuid.uuid,
        created_at: data.created_at
      }

    })

    return {
      uuid: new Uuid(group.uuid),
      group_name: group.group_name,
      employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
      value: group.value,
      business_info_uuid: new Uuid(group.business_info_uuid),
      is_default: group.is_default,
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
        employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
        value: group.value,
        business_info_uuid: new Uuid(group.business_info_uuid),
        is_default: group.is_default,
        created_at: group.created_at,
        updated_at: group.updated_at
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
        employer_item_details_uuid: data.employer_item_details_uuid.uuid,
        value: data.value,
        is_default: data.is_default,
        business_info_uuid: data.business_info_uuid.uuid,
        created_at: data.created_at
      },
      update: {
        group_name: data.group_name,
        employer_item_details_uuid: data.employer_item_details_uuid.uuid,
        value: data.value,
        is_default: data.is_default,
        business_info_uuid: data.business_info_uuid.uuid,
        updated_at: data.updated_at
      }
    })

    return {
      uuid: new Uuid(group.uuid),
      group_name: group.group_name,
      employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
      value: group.value,
      business_info_uuid: new Uuid(group.business_info_uuid),
      is_default: group.is_default,
      created_at: group.created_at,
      updated_at: group.updated_at
    } as BenefitGroupsEntity
  }

  async findByNameAndDefault(group_name: string, is_default: boolean, business_info_uuid: string): Promise<BenefitGroupsEntity | null> {
    const group = await prismaClient.benefitGroups.findFirst({
      where: {
        group_name,
        is_default,
        business_info_uuid
      }

    })
    if (!group) return null

    return {
      uuid: new Uuid(group.uuid),
      group_name: group.group_name,
      employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
      value: group.value,
      business_info_uuid: new Uuid(group.business_info_uuid),
      is_default: group.is_default,
      created_at: group.created_at,
      updated_at: group.updated_at
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
      employer_item_details_uuid: new Uuid(group.employer_item_details_uuid),
      value: group.value,
      business_info_uuid: new Uuid(group.business_info_uuid),
      is_default: group.is_default,
      created_at: group.created_at,
      updated_at: group.updated_at
    } as BenefitGroupsEntity
  }
  async findAll(): Promise<BenefitGroupsEntity[]> {
    throw new Error("Method not implemented.");
  }

}

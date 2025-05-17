import { includes, random } from "lodash";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { PartnerCategory, PartnerConfigEntity } from "../../../entities/partner-config.entity";
import { IPartnerConfigRepository } from "../../partner-config.repository";
import { BusinessAccountEntity } from "../../../entities/business-account.entity";

export class PartnerConfigPrismaRepository implements IPartnerConfigRepository {
  // async upsert(data: PartnerConfigEntity): Promise<PartnerConfigEntity> {
  //   const partnerConfig = await prismaClient.partnerConfig.upsert({
  //     where:{
  //       uuid: data.uuid.uuid
  //     },
  //     create:{
  //       uuid: data
  //     },
  //     update:{

  //     }
  //   })
  // }

  async create(entity: PartnerConfigEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async update(entity: PartnerConfigEntity): Promise<void> {
    await prismaClient.partnerConfig.update({
      where: {
        uuid: entity.uuid.uuid
      },
      data: {
        uuid: entity.uuid.uuid,
        business_info_uuid: entity.business_info_uuid.uuid,
        main_branch: entity.main_branch.uuid,
        partner_category: entity.partner_category,
        items_uuid: entity.items_uuid,
        admin_tax: entity.admin_tax,
        marketing_tax: entity.marketing_tax,
        use_marketing: entity.use_marketing,
        market_place_tax: entity.market_place_tax,
        use_market_place: entity.use_market_place,
        title: entity.title,
        phone: entity.phone,
        description: entity.description,
        sales_type: entity.sales_type,
        updated_at: entity.updated_at
      }
    })
  }
  async find(id: Uuid): Promise<PartnerConfigEntity | null> {
    const config = await prismaClient.partnerConfig.findUnique({
      where: {
        uuid: id.uuid
      }
    })

    if (!config) return null
    return {
      uuid: new Uuid(config.uuid),
      business_info_uuid: new Uuid(config.business_info_uuid),
      main_branch: new Uuid(config.main_branch),
      partner_category: config.partner_category,
      items_uuid: config.items_uuid,
      admin_tax: config.admin_tax,
      marketing_tax: config.marketing_tax,
      use_marketing: config.use_marketing,
      market_place_tax: config.market_place_tax,
      use_market_place: config.use_market_place,
      title: config.title,
      phone: config.phone,
      description: config.description,
      sales_type: config.sales_type,
      cashback_tax: config.cashback_tax,
    } as PartnerConfigEntity
  }

  async findByPartnerId(id: string): Promise<PartnerConfigEntity | null> {
    const config = await prismaClient.partnerConfig.findUnique({
      where: {
        business_info_uuid: id
      }
    })

    if (!config) return null
    return {
      uuid: new Uuid(config.uuid),
      business_info_uuid: new Uuid(config.business_info_uuid),
      main_branch: new Uuid(config.main_branch),
      partner_category: config.partner_category,
      items_uuid: config.items_uuid,
      admin_tax: config.admin_tax,
      marketing_tax: config.marketing_tax,
      use_marketing: config.use_marketing,
      market_place_tax: config.market_place_tax,
      use_market_place: config.use_market_place,
      title: config.title,
      phone: config.phone,
      description: config.description,
      sales_type: config.sales_type,
      cashback_tax: config.cashback_tax,
    } as PartnerConfigEntity
  }
  findAll(): Promise<PartnerConfigEntity[]> {
    throw new Error("Method not implemented.");
  }

  async createPartnerConfig(data: PartnerConfigEntity, businessAccountEntity: BusinessAccountEntity): Promise<PartnerConfigEntity> {

    const [config, businessAccount] = await prismaClient.$transaction([
      prismaClient.partnerConfig.create({

        data: {
          uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          main_branch: data.main_branch.uuid,
          partner_category: data.partner_category,
          items_uuid: data.items_uuid,
          admin_tax: data.admin_tax,
          marketing_tax: data.marketing_tax,
          use_marketing: data.use_marketing,
          market_place_tax: data.market_place_tax,
          use_market_place: data.use_market_place,
          cashback_tax: data.cashback_tax,
          created_at: data.created_at
        }

      }),
      prismaClient.businessAccount.create({
        data:{
          uuid: businessAccountEntity.uuid,
          balance: businessAccountEntity.balance,
          business_info_uuid: data.business_info_uuid.uuid,
          status: businessAccountEntity.status,
          created_at: data.created_at,
        }
      })

    ])

    return {
      uuid: new Uuid(config.uuid),
      business_info_uuid: new Uuid(config.business_info_uuid),
      partner_category: config.partner_category as PartnerCategory[],
      items_uuid: config.items_uuid,
      admin_tax: config.admin_tax,
      marketing_tax: config.marketing_tax,
      market_place_tax: config.market_place_tax,
      created_at: config.created_at
    } as PartnerConfigEntity
  }

  async findPartnersByCategory(partner_category: string, page: number, limit: number): Promise<any[]> {
    const take = limit; // Quantidade de registros por página
    const skip = (page - 1) * limit; // Quantos registros pular

    const partners = await prismaClient.partnerConfig.findMany({
      where: {
        partner_category: {
          has: partner_category
        }

      },
      include: {
        BusinessInfo: {
          include: {
            Address: true
          }
        },

      },
      skip,
      take
    })
    return partners
  }

  async filterPartnersByAppUser(partner_category: string, page: number, limit: number, branch_uuid?: string, city?: string, search?: string, item_uuid?: string): Promise<any[]> {
    const take = limit; // Quantidade de registros por página
    const skip = (page - 1) * limit; // Quantos registros pular
    const where: any = {
      partner_category: {
        has: partner_category,
      }
    };

    if (branch_uuid) {
      where.main_branch = branch_uuid;
    }

    if (city || search) {
      where.BusinessInfo = { Address: {} };

      if (city) {
        where.BusinessInfo.Address.city = city;
      }

      if (search) {
        where.BusinessInfo.OR = [
          { fantasy_name: { contains: search, mode: 'insensitive' } },
          { corporate_reason: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    if (item_uuid) {
      where.items_uuid = {
        has: item_uuid
      };
    }

    const partners = await prismaClient.partnerConfig.findMany({
      where,
      include: {
        BusinessInfo: {
          include: {
            Address: true
          }
        }
      },
      skip,
      take
    })
    return partners
  }
}

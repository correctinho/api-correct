import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { PartnerCategory, PartnerConfigEntity } from "../../../entities/partner-config.entity";
import { IPartnerConfigRepository } from "../../partner-config.repository";

export class PartnerConfigPrismaRepository implements IPartnerConfigRepository{

  create(entity: PartnerConfigEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  update(entity: PartnerConfigEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  find(id: Uuid): Promise<PartnerConfigEntity> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<PartnerConfigEntity[]> {
    throw new Error("Method not implemented.");
  }

  async createPartnerConfig(data: PartnerConfigEntity): Promise<PartnerConfigEntity> {
    const config = await  prismaClient.partnerConfig.create({

        data:{
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
          created_at: data.created_at
        }

      })

    return {
      uuid: new Uuid (config.uuid),
      business_info_uuid: new Uuid(config.business_info_uuid),
      partner_category: config.partner_category as PartnerCategory[],
      items_uuid: config.items_uuid,
      admin_tax: config.admin_tax,
      marketing_tax: config.marketing_tax,
      market_place_tax: config.market_place_tax,
      created_at: config.created_at
    } as PartnerConfigEntity
  }

  async findPartnersByCategory(partner_category: string): Promise<any[]>{
    const partners = await prismaClient.partnerConfig.findMany({
      where:{
        partner_category: {
          has: partner_category
        },
        NOT:{
          use_marketing: false
        }
      },
      include:{
        BusinessInfo:{
          include:{
            Address: true
          }
        }
      }
    })
    return partners
  }

}

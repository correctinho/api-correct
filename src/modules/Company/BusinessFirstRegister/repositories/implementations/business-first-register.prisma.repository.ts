import { add } from "lodash";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { PartnerConfigEntity } from "../../../PartnerConfig/entities/partner-config.entity";
import { BusinessRegisterEntity } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../business-first-register.repository";
import { randomUUID } from 'crypto'

export class BusinessRegisterPrismaRepository implements IBusinessFirstRegisterRepository {
  save(data: any, data1: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  async saveEmployer(data: BusinessRegisterEntity, correctUserUuid?: string): Promise<any> {
    const [address, businessInfo, businessItem, correct] = await prismaClient.$transaction([
      prismaClient.address.create({
        data: {
          uuid: data.address_pk_uuid,
          line1: data.line1,
          line2: data.line2,
          line3: data.line3,
          postal_code: data.postal_code,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          country: data.country
        }
      }),

      prismaClient.businessInfo.create({
        data: {
          uuid: data.business_info_uuid,
          address_uuid: data.address_pk_uuid,
          fantasy_name: data.fantasy_name,
          corporate_reason: data.corporate_reason,
          document: data.document,
          classification: data.classification,
          colaborators_number: data.colaborators_number,
          status: data.status,
          phone_1: data.phone_1,
          phone_2: data.phone_2,
          email: data.email,
          business_type: data.business_type,
          employer_branch: data.employer_branch,
          created_at: newDateF(new Date())
        }
      }),
      prismaClient.employerItemDetails.createMany({
        data: data.items_uuid.map(itemUuid => ({
          uuid: randomUUID(),
          item_uuid: itemUuid,
          business_info_uuid: data.business_info_uuid,
          is_active: false,
          created_at: newDateF(new Date())
        }))
      }),
      prismaClient.correctUserBusinessInfo.create({
        data:{
          uuid: randomUUID(),
          business_info_uuid: data.business_info_uuid,
          correct_admin_uuid: correctUserUuid,
          created_at: newDateF(new Date())
        }
      })
    ])
    return {
      Address: {
        uuid: address.uuid,
        line1: address.line1,
        line2: address.line2,
        line3: address.line3,
        postal_code: address.postal_code,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        country: address.country,
        created_at: address.created_at
      },
      BusinessInfo: {
        uuid: businessInfo.uuid,
        address_uuid: businessInfo.address_uuid,
        fantasy_name: businessInfo.fantasy_name,
        corporate_reason: businessInfo.corporate_reason,
        document: businessInfo.document,
        classification: businessInfo.classification,
        colaborators_number: businessInfo.colaborators_number,
        status: businessInfo.status,
        phone_1: businessInfo.phone_1,
        phone_2: businessInfo.phone_2,
        business_type: businessInfo.business_type,
        email: businessInfo.email,
        created_at: businessInfo.created_at
      },
      CorrectUserBusinessBranch: {
        uuid: correct.uuid,
        business_info_uuid: correct.business_info_uuid,
        correct_user_uuid: correct.correct_admin_uuid,
        created_at: correct.created_at
      }

    }
  }
  async savePartner(data: BusinessRegisterEntity, partnerConfig: PartnerConfigEntity, correctUserUuid?: string): Promise<any> {
    const [address, businessInfo, business_branch, correctUserBusiness] = await prismaClient.$transaction([

      prismaClient.address.create({
        data: {
          uuid: data.address_pk_uuid,
          line1: data.line1,
          line2: data.line2,
          line3: data.line3,
          postal_code: data.postal_code,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          country: data.country
        }
      }),

      prismaClient.businessInfo.create({
        data: {
          uuid: data.business_info_uuid,
          address_uuid: data.address_pk_uuid,
          fantasy_name: data.fantasy_name,
          corporate_reason: data.corporate_reason,
          document: data.document,
          classification: data.classification,
          colaborators_number: data.colaborators_number,
          status: data.status,
          phone_1: data.phone_1,
          phone_2: data.phone_2,
          email: data.email,
          business_type: data.business_type,
          created_at: newDateF(new Date())
        }
      }),

      prismaClient.businessinfoBranch.createMany({
        data: data.branches_uuid.map(branchUuid => ({
          uuid: randomUUID(),
          branch_info_uuid: branchUuid,
          business_info_uuid: data.business_info_uuid,
          created_at: newDateF(new Date())
        }))
      }),

      prismaClient.correctUserBusinessInfo.create({
        data:{
          uuid: randomUUID(),
          business_info_uuid: data.business_info_uuid,
          correct_admin_uuid: correctUserUuid,
          created_at: newDateF(new Date())
        }
      }),

      prismaClient.partnerConfig.create({
        data:{
          uuid: randomUUID(),
          business_info_uuid: data.business_info_uuid,
          main_branch: partnerConfig.main_branch.uuid,
          partner_category: partnerConfig.partner_category,
          items_uuid: partnerConfig.items_uuid,
          admin_tax: partnerConfig.admin_tax,
          marketing_tax: partnerConfig.marketing_tax,
          use_marketing: partnerConfig.use_marketing,
          market_place_tax: partnerConfig.market_place_tax,
          use_market_place: partnerConfig.use_market_place,
          latitude: partnerConfig.latitude,
          longitude: partnerConfig.longitude,
          title: partnerConfig.title,
          created_at: partnerConfig.created_at,
        },

      }),
      prismaClient.businessAccount.create({
        data:{
          uuid: randomUUID(),
          balance: 0,
          business_info_uuid: data.business_info_uuid,
          status: "active",
          created_at: partnerConfig.created_at,
        }
      })
    ])

    return {
      Address: {
        uuid: address.uuid,
        line1: address.line1,
        line2: address.line2,
        line3: address.line3,
        postal_code: address.postal_code,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        country: address.country,
        created_at: address.created_at
      },
      BusinessInfo: {
        uuid: businessInfo.uuid,
        address_uuid: businessInfo.address_uuid,
        fantasy_name: businessInfo.fantasy_name,
        corporate_reason: businessInfo.corporate_reason,
        document: businessInfo.document,
        classification: businessInfo.classification,
        colaborators_number: businessInfo.colaborators_number,
        status: businessInfo.status,
        phone_1: businessInfo.phone_1,
        phone_2: businessInfo.phone_2,
        business_type: businessInfo.business_type,
        email: businessInfo.email,
        created_at: businessInfo.created_at
      },
      CorrectUserBusinessBranch: {
        uuid: correctUserBusiness.uuid,
        business_info_uuid: correctUserBusiness.business_info_uuid,
        correct_user_uuid: correctUserBusiness.correct_admin_uuid,
        created_at: correctUserBusiness.created_at
      },
      PartnerConfig: {
        uuid: partnerConfig.uuid.uuid,
        business_info_uuid: partnerConfig.business_info_uuid.uuid,
        main_branch: partnerConfig.main_branch.uuid,
        partner_category: partnerConfig.partner_category,
        items_uuid: partnerConfig.items_uuid,
        admin_tax: partnerConfig.admin_tax,
        marketing_tax: partnerConfig.marketing_tax,
        use_marketing: partnerConfig.use_marketing,
        market_place_tax: partnerConfig.market_place_tax,
        use_market_place: partnerConfig.use_market_place,
        created_at: partnerConfig.created_at
      }
    }
  }

}

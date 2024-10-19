import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { BusinessRegisterEntity } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../business-first-register.repository";
import { randomUUID } from 'crypto'

export class BusinessRegisterPrismaRepository implements IBusinessFirstRegisterRepository {
  async saveEmployer(data: BusinessRegisterEntity): Promise<void> {
    const [address, businessInfo, businessItem] = await prismaClient.$transaction([
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
      })
    ])
  }
  async save(data: BusinessRegisterEntity): Promise<void> {
    const [address, businessInfo, business_branch] = await prismaClient.$transaction([

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
      })
    ])
  }

}

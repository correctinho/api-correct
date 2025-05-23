import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { BusinessAccountEntity } from "../../../entities/business-account.entity";
import { IBusinessAccountRepository } from "../business-account.repository";

export class BusinessAccountPrismaRepository implements IBusinessAccountRepository {

  find(id: Uuid): Promise<BusinessAccountEntity> {
    throw new Error("Method not implemented.");
  }
  create(entity: BusinessAccountEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  update(entity: BusinessAccountEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<BusinessAccountEntity[]> {
    throw new Error("Method not implemented.");
  }

  async findByBusinessId(businessId: string): Promise<BusinessAccountEntity | null> {
    const result = await prismaClient.businessAccount.findFirst({
      where: {
        business_info_uuid: businessId
      }
    })

    if (!result) return null
    return {
      uuid: result.uuid,
      business_info_uuid: result.business_info_uuid,
      balance: result.balance,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
    } as BusinessAccountEntity
  }
}

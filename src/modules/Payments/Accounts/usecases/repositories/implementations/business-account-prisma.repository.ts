import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { BusinessAccountEntity, BusinessAccountProps } from "../../../entities/business-account.entity";
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
    // 1. Busca os dados brutos da conta no banco
    const accountData = await prismaClient.businessAccount.findFirst({
      where: {
        business_info_uuid: businessId
      }
    });

    if (!accountData) {
      return null;
    }

    // 2. Prepara as 'props' para a hidratação, convertendo strings para Value Objects
    const accountProps: BusinessAccountProps = {
      uuid: new Uuid(accountData.uuid),
      balance: accountData.balance,
      business_info_uuid: new Uuid(accountData.business_info_uuid),
      status: accountData.status,
      created_at: accountData.created_at,
      updated_at: accountData.updated_at,
    };

    // 3. Usa o método estático 'hydrate' para reconstruir a entidade completa.
    //    Isso garante que o objeto retornado tenha todos os métodos (como .toJSON()).
    return BusinessAccountEntity.hydrate(accountProps);
  }
}

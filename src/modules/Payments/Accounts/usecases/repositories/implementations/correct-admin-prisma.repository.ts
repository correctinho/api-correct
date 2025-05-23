import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { OutputGetCorrectAdminAccountDTO } from "../../correctAdmin/dto/correct-admin-accounts.dto";
import { ICorrectAdminAccountRepository } from "../correct-admin-account.repository";

export class CorrectAdminAccountPrismaRepository implements ICorrectAdminAccountRepository {
  async find(): Promise<OutputGetCorrectAdminAccountDTO | null> {
    const result = await prismaClient.correctAccount.findFirst({})

    if (!result) return null
    return {
      uuid: result.uuid,
      balance: result.balance,
      status: result.status,
      created_at: result.created_at,
      updated_at: result.updated_at,
    }
  }

}

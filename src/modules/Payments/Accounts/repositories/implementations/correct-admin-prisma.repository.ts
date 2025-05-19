import { update } from "lodash";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { ICorrectAdminAccountRepository } from "../correct-admin-account.repository";
import { OutputGetCorrectAdminAccountDTO } from "../../usecases/correctAdmin/dto/correct-admin-accounts.dto";

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

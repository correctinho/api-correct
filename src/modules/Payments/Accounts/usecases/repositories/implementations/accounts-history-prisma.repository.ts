import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { OutputGetUserItemHistoryDTO } from "../../account-histories/app-user/dto/get-history-by-userItem-id.usecase.dto";
import { OutputGetBusinessAccountHistoryDTO } from "../../account-histories/business-user/dto/get-business-account-by-admin.dto";
import { IAccountsHistoryRepository } from "../accounts-history.repository";

export class AccountsHistoryPrismaRepository implements IAccountsHistoryRepository {
  async findBusinessAccountHistory(business_account_uuid: string, yearToQuery?: number, monthToQuery?: number): Promise<OutputGetBusinessAccountHistoryDTO[] | []> {
    const startDate = new Date(Date.UTC(yearToQuery, monthToQuery - 1, 1)); // monthToQuery - 1 para 0-indexed month
    const endDate = new Date(Date.UTC(yearToQuery, monthToQuery, 1));

    const result = await prismaClient.businessAccountHistory.findMany({
      where:{
        business_account_uuid: business_account_uuid,
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        uuid: true,
        business_account_uuid: true,
        event_type: true,
        amount: true,
        balance_before: true,
        balance_after: true,
        related_transaction_uuid: true,
        created_at: true
      }
    })

    return result.map(item => ({
      uuid: item.uuid,
      business_account_uuid: item.uuid,
      event_type: String(item.event_type),
      amount: item.amount,
      balance_before: item.balance_before,
      balance_after: item.balance_after,
      related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
      created_at: item.created_at
    }))

  }
  async findUserItemHistory(userItemId: string, yearToQuery?: number, monthToQuery?: number): Promise<OutputGetUserItemHistoryDTO[] | []> {
    const startDate = new Date(Date.UTC(yearToQuery, monthToQuery - 1, 1)); // monthToQuery - 1 para 0-indexed month
    const endDate = new Date(Date.UTC(yearToQuery, monthToQuery, 1));

    const result = await prismaClient.userItemHistory.findMany({

      where: {
        user_item_uuid: userItemId,
        created_at: {
          gte: startDate, // gte = greater than or equal to (maior ou igual a)
          lte: endDate
        },
      },
      orderBy: {
        created_at: 'desc', // Ordenar do mais recente para o mais antigo
      },
      select: {
        uuid: true,
        event_type: true,
        amount: true,
        balance_before: true,
        balance_after: true,
        related_transaction_uuid: true,
        created_at: true,
        UserItem: {
          select: {
            user_info_uuid: true
          }
        }
      }
    }
    )

    return result.map(item => ({
      uuid: item.uuid,
      event_type: String(item.event_type),
      amount: item.amount,
      balance_before: item.balance_before,
      balance_after: item.balance_after,
      related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
      user_info_uuid: item.UserItem.user_info_uuid,
      created_at: item.created_at,
    }));
  }
}

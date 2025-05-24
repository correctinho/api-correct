import { OutputGetUserItemHistoryDTO } from "../account-histories/app-user/dto/get-history-by-userItem-id.usecase.dto"
import { OutputGetBusinessAccountHistoryDTO } from "../account-histories/business-user/dto/get-business-account-by-admin.dto"

export interface IAccountsHistoryRepository {
  findUserItemHistory(userItemId: string, yearToQuery?: number, monthToQuery?: number): Promise<OutputGetUserItemHistoryDTO[] | []>
  findBusinessAccountHistory(business_info_uuid: string, yearToQuery?: number, monthToQuery?: number): Promise<OutputGetBusinessAccountHistoryDTO[] | []>
}

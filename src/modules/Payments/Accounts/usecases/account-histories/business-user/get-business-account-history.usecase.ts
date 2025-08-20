// ... imports ...

import { CustomError } from "../../../../../../errors/custom.error";
import { IAccountsHistoryRepository } from "../../repositories/accounts-history.repository";
import { IBusinessAccountRepository } from "../../repositories/business-account.repository";
import { InputGetBusinessAccountHistoryDTO, OutputGetBusinessAccountHistoryDTO } from "./dto/get-business-account-by-admin.dto";

export class GetBusinessAccountHistoryUsecase {
  constructor(
    private accountHistoryRepository: IAccountsHistoryRepository,
    private businessAccountRepository: IBusinessAccountRepository
  ) { }
  async execute(data: InputGetBusinessAccountHistoryDTO): Promise<OutputGetBusinessAccountHistoryDTO[] | []> {
    if (!data.business_info_uuid) throw new CustomError("Business info uuid is required", 400);
    const now = new Date();
    
    // --- CORREÇÃO AQUI ---
    // Converte os parâmetros de entrada para números inteiros.
    let yearToQuery = data.year ? parseInt(String(data.year), 10) : undefined;
    let monthToQuery = data.month ? parseInt(String(data.month), 10) : undefined;

    if (monthToQuery !== undefined) {
      // Agora a validação funcionará corretamente com números
      if (isNaN(monthToQuery) || monthToQuery < 1 || monthToQuery > 12) {
        throw new CustomError("Mês inválido. Por favor, forneça um valor entre 1 e 12.", 400);
      }
      if (yearToQuery === undefined) {
        yearToQuery = now.getFullYear();
      }
    } else {
      yearToQuery = now.getFullYear();
      monthToQuery = now.getMonth() + 1;
    }

    if (yearToQuery === undefined || isNaN(yearToQuery)) {
        throw new CustomError("Ano inválido.", 400)
    }

    // O restante do código permanece o mesmo...
    const businessAccount = await this.businessAccountRepository.findByBusinessId(data.business_info_uuid)
    if(!businessAccount) throw new CustomError("Business account not found", 404)

    const accountHistory = await this.accountHistoryRepository.findBusinessAccountHistory(businessAccount.uuid.uuid, yearToQuery, monthToQuery)
    if(accountHistory.length === 0) return []

    return accountHistory.map((item: OutputGetBusinessAccountHistoryDTO) => ({
      uuid: item.uuid,
      business_account_uuid: item.business_account_uuid,
      event_type: item.event_type,
      amount: item.amount / 100,
      balance_before: item.balance_before / 100,
      balance_after: item.balance_after / 100,
      related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
      created_at: item.created_at
    }))
  }
}
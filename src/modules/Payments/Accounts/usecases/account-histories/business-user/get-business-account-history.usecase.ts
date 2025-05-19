import { CustomError } from "../../../../../../errors/custom.error";
import { IAccountsHistoryRepository } from "../../../repositories/accounts-history.repository";
import { IBusinessAccountRepository } from "../../../repositories/business-account.repository";
import { InputGetBusinessAccountHistoryDTO, OutputGetBusinessAccountHistoryDTO } from "./dto/get-business-account-by-admin.dto";

export class GetBusinessAccountHistoryUsecase {
  constructor(
    private accountHistoryRepository: IAccountsHistoryRepository,
    private businessAccountRepository: IBusinessAccountRepository
  ) { }
  async execute(data: InputGetBusinessAccountHistoryDTO): Promise<OutputGetBusinessAccountHistoryDTO[] | []> {
    if (!data.business_info_uuid) throw new CustomError("Business info uuid is required", 400);

    const now = new Date();
    let yearToQuery = data.year;
    let monthToQuery = data.month; // 1-indexed


    if (monthToQuery !== undefined) {
      if (monthToQuery < 1 || monthToQuery > 12) {
        throw new CustomError("Mês inválido. Por favor, forneça um valor entre 1 e 12.", 400);
      }
      // Se monthToQuery é fornecido, yearToQuery deveria ser também, ou usar o ano atual como padrão.
      if (yearToQuery === undefined) {
        yearToQuery = now.getFullYear();
        // Opcional: Adicionar um log ou aviso se o ano não foi fornecido com o mês.
      }
    } else {
      // Padrão: mês e ano atuais se nenhum foi fornecido
      yearToQuery = now.getFullYear();
      monthToQuery = now.getMonth() + 1; // getMonth() é 0-indexed
    }

    if (yearToQuery === undefined || monthToQuery === undefined) {
      // Esta condição não deveria ser atingida com a lógica acima se o objetivo é sempre ter um mês/ano.
      // Mas é uma salvaguarda ou ponto de decisão se a lógica de input for mais complexa.
      throw new CustomError("Ano e Mês devem ser especificados ou deixados em branco para usar o padrão.", 400)
    }

    //find business account
    const businessAccount = await this.businessAccountRepository.findByBusinessId(data.business_info_uuid)
    if(!businessAccount) throw new CustomError("Business account not found", 404)
    console.log({businessAccount})
    //find history
    const accountHistory = await this.accountHistoryRepository.findBusinessAccountHistory(businessAccount.uuid, yearToQuery, monthToQuery)
    console.log({accountHistory})
    if(accountHistory.length === 0) return []

    return accountHistory.map((item: OutputGetBusinessAccountHistoryDTO) => ({
      uuid: item.uuid,
      business_account_uuid: item.business_account_uuid,
      event_type: item.event_type,
      amount: item.amount,
      balance_before: item.balance_before,
      balance_after: item.balance_after,
      related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
      created_at: item.created_at
    }))



  }
}

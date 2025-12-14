import { CustomError } from "../../../../../../errors/custom.error";
import { IAccountsHistoryRepository } from "../../repositories/accounts-history.repository";
import { InputGetUserItemHistoryDTO, OutputGetUserItemHistoryDTO } from "./dto/get-history-by-userItem-id.usecase.dto";

export class GetAppUserHistoryByAccountIdUsecase {
  constructor(
    private accountHistoryRepository: IAccountsHistoryRepository,
  ) {

  }
  async execute(data: InputGetUserItemHistoryDTO): Promise<OutputGetUserItemHistoryDTO[] | []> {
    if (!data.user_item_uuid) throw new CustomError("Item Id is required", 400)
    if (!data.user_info_uuid) throw new CustomError("User info id is required", 400)
      console.log("DATA RECEBIDA NO USECASE:", data);
    let finalStartDate: Date;
    let finalEndDate: Date;

    // ESTRATÉGIA 1: Intervalo de Datas Personalizado (Prioritário)
    if (data.startDate && data.endDate) {
        if (data.startDate >= data.endDate) {
            throw new CustomError("A data inicial deve ser anterior à data final.", 400);
        }
        finalStartDate = data.startDate;
        const adjustedEndDate = new Date(data.endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        
        finalEndDate = adjustedEndDate;
        // Ajuste opcional: garantir que a data final pegue até o último momento do dia se vier só YYYY-MM-DD
        // Ex: se endDate for 2025-12-13 00:00:00, talvez queira 2025-12-13 23:59:59.
        // Depende de como o front envia. Se o front enviar ISO completo, não precisa mexer.
        //finalEndDate = data.endDate;
    } 
    // ESTRATÉGIA 2: Mês/Ano (Legado/Padrão)
    else {
        const now = new Date();
        let yearToQuery = data.year;
        let monthToQuery = data.month; // 1-indexed

        if (monthToQuery !== undefined) {
          if (monthToQuery < 1 || monthToQuery > 12) {
            throw new CustomError("Mês inválido. Entre 1 e 12.", 400);
          }
          if (yearToQuery === undefined) yearToQuery = now.getFullYear();
        } else {
          // Padrão: mês e ano atuais
          yearToQuery = now.getFullYear();
          monthToQuery = now.getMonth() + 1;
        }

        // Calcula o primeiro dia do mês
        finalStartDate = new Date(Date.UTC(yearToQuery, monthToQuery - 1, 1));
        // Calcula o primeiro dia do próximo mês (para usar com 'lt' - menor que)
        finalEndDate = new Date(Date.UTC(yearToQuery, monthToQuery, 1));
        // ---------------------------------------------------------------------
    }

    // CHAMADA AO REPOSITÓRIO ATUALIZADA: Passamos as datas prontas
    const userItemHistory = await this.accountHistoryRepository.findUserItemHistory(
        data.user_item_uuid, 
        finalStartDate, 
        finalEndDate
    );

    if (userItemHistory.length === 0) return [];

    if (userItemHistory[0].user_info_uuid !== data.user_info_uuid) throw new CustomError("Unauthorized access", 403);
    // const now = new Date();
    // let yearToQuery = data.year;
    // let monthToQuery = data.month; // 1-indexed

    // if (monthToQuery !== undefined) {
    //   if (monthToQuery < 1 || monthToQuery > 12) {
    //     throw new CustomError("Mês inválido. Por favor, forneça um valor entre 1 e 12.", 400);
    //   }
    //   // Se monthToQuery é fornecido, yearToQuery deveria ser também, ou usar o ano atual como padrão.
    //   if (yearToQuery === undefined) {
    //     yearToQuery = now.getFullYear();
    //     // Opcional: Adicionar um log ou aviso se o ano não foi fornecido com o mês.
    //   }
    // } else {
    //   // Padrão: mês e ano atuais se nenhum foi fornecido
    //   yearToQuery = now.getFullYear();
    //   monthToQuery = now.getMonth() + 1; // getMonth() é 0-indexed
    // }

    // if (yearToQuery === undefined || monthToQuery === undefined) {
    //   // Esta condição não deveria ser atingida com a lógica acima se o objetivo é sempre ter um mês/ano.
    //   // Mas é uma salvaguarda ou ponto de decisão se a lógica de input for mais complexa.
    //   throw new CustomError("Ano e Mês devem ser especificados ou deixados em branco para usar o padrão.", 400)
    // }

    // //get history
    // const userItemHistory = await this.accountHistoryRepository.findUserItemHistory(data.user_item_uuid, yearToQuery, monthToQuery)
    // if (userItemHistory.length === 0) return []

    // //check user item belongs to correct user. In this case, all items will always have some user info uuid.
    // // So we can compare only the first history
    // if (userItemHistory[0].user_info_uuid !== data.user_info_uuid) throw new CustomError("Unauthorized access", 403)

    return userItemHistory.map((item: OutputGetUserItemHistoryDTO) => ({
      uuid: item.uuid,
      event_type: String(item.event_type),
      amount: item.amount / 100,
      balance_before: item.balance_before / 100,
      balance_after: item.balance_after / 100,
      related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
      user_info_uuid: item.user_info_uuid,
      counterparty_name: item.counterparty_name || null,
      created_at: item.created_at,
    }))


  }
}

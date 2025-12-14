import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { OutputGetUserItemHistoryDTO } from "../../account-histories/app-user/dto/get-history-by-userItem-id.usecase.dto";
import { OutputGetBusinessAccountHistoryDTO } from "../../account-histories/business-user/dto/get-business-account-by-admin.dto";
import { IAccountsHistoryRepository } from "../accounts-history.repository";

export class AccountsHistoryPrismaRepository implements IAccountsHistoryRepository {

  async findBusinessAccountHistory(business_account_uuid: string, yearToQuery?: number, monthToQuery?: number): Promise<OutputGetBusinessAccountHistoryDTO[] | []> {

    // --- LÓGICA DE DATA CORRIGIDA ---
    const startDate = new Date(Date.UTC(yearToQuery, monthToQuery - 1, 1));
    // A data final agora é o primeiro dia do mês seguinte, para ser usada com 'lt' (menor que).
    const endDate = new Date(Date.UTC(yearToQuery, monthToQuery, 1));

    const result = await prismaClient.businessAccountHistory.findMany({
      where: {
        business_account_uuid: business_account_uuid,
        created_at: {
          gte: startDate, // Maior ou igual ao primeiro dia do mês
          lt: endDate     // <<< CORREÇÃO: Menor que o primeiro dia do mês seguinte
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
    });

    return result.map(item => ({
      uuid: item.uuid,
      business_account_uuid: item.business_account_uuid,
      event_type: String(item.event_type),
      amount: item.amount,
      balance_before: item.balance_before,
      balance_after: item.balance_after,
      related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
      created_at: item.created_at
    }));
  }

  // async findUserItemHistory(userItemId: string, yearToQuery?: number, monthToQuery?: number): Promise<OutputGetUserItemHistoryDTO[] | []> {
  //   // Aplicando a mesma correção de data para o histórico do usuário para consistência
  //   const startDate = new Date(Date.UTC(yearToQuery, monthToQuery - 1, 1));
  //   const endDate = new Date(Date.UTC(yearToQuery, monthToQuery, 1));

  //   const result = await prismaClient.userItemHistory.findMany({
  //     where: {
  //       user_item_uuid: userItemId,
  //       created_at: {
  //         gte: startDate,
  //         lt: endDate 
  //       },
  //     },
  //     orderBy: {
  //       created_at: 'desc',
  //     },
  //     select: {
  //       uuid: true,
  //       event_type: true,
  //       amount: true,
  //       balance_before: true,
  //       balance_after: true,
  //       related_transaction_uuid: true,
  //       created_at: true,
  //       UserItem: {
  //         select: {
  //           user_info_uuid: true
  //         }
  //       },
  //     }
  //   });

  //   return result.map(item => ({
  //     uuid: item.uuid,
  //     event_type: String(item.event_type),
  //     amount: item.amount,
  //     balance_before: item.balance_before,
  //     balance_after: item.balance_after,
  //     related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
  //     user_info_uuid: item.UserItem.user_info_uuid,
  //     created_at: item.created_at,
  //   }));
  // }

  async findUserItemHistory(userItemId: string, startDate: Date, endDate: Date): Promise<OutputGetUserItemHistoryDTO[] | []> {
    // const startDate = new Date(Date.UTC(yearToQuery, monthToQuery - 1, 1));
    // const endDate = new Date(Date.UTC(yearToQuery, monthToQuery, 1));
    const result = await prismaClient.userItemHistory.findMany({
      where: {
        user_item_uuid: userItemId,
        created_at: { gte: startDate, lt: endDate },
      },
      orderBy: { created_at: 'desc' },
      include: {
        UserItem: { select: { user_info_uuid: true } },
        RelatedTransaction: {
          include: {
            // 1. Favorecido Pessoa Física (para TEI enviada)
            UserInfo: { select: { full_name: true } },
            // 2. Favorecido Empresa (para Pagamentos em Comércio) - NOVO!
            BusinessInfo: { select: { fantasy_name: true } },
            // 3. Pagador Original (para TEI recebida)
            UserItem: {
              include: {
                UserInfo: { select: { full_name: true } }
              }
            }
          }
        }
      }
    });

    // --- MAPEAMENTO INTELIGENTE E GENÉRICO ---
    return result.map(item => {
      const relatedTx = item.RelatedTransaction;
      let counterpartyName: string | null = null;

      if (relatedTx) {
        // SE O DINHEIRO SAIU DA CONTA (Débito: amount negativo)
        if (item.amount < 0) {
          // Prioridade 1: Foi para uma empresa? (Pagamento em comércio)
          if (relatedTx.BusinessInfo) {
             // Tenta nome fantasia, se não tiver, usa razão social
             counterpartyName = relatedTx.BusinessInfo.fantasy_name
          }
          // Prioridade 2: Foi para outra pessoa? (TEI Enviada)
          else if (relatedTx.UserInfo) {
             counterpartyName = relatedTx.UserInfo.full_name;
          }
        }
        // SE O DINHEIRO ENTROU NA CONTA (Crédito: amount positivo)
        else if (item.amount > 0) {
          // Veio de outra pessoa? (TEI Recebida)
          // Verifica quem era o dono do item que originou a transação
          if (relatedTx.UserItem?.UserInfo) {
            counterpartyName = relatedTx.UserItem.UserInfo.full_name;
          }
          // Nota: Se no futuro empresas puderem pagar usuários (ex: salário),
          // adicionaríamos aqui um check para 'relatedTx.PayerBusiness'.
        }
      }

      return {
        uuid: item.uuid,
        event_type: String(item.event_type),
        amount: item.amount,
        balance_before: item.balance_before,
        balance_after: item.balance_after,
        related_transaction_uuid: item.related_transaction_uuid ? item.related_transaction_uuid : "",
        user_info_uuid: item.UserItem.user_info_uuid,
        created_at: item.created_at,
        counterparty_name: counterpartyName
      };
    });
  }
}

import { CustomError } from "../../../../../errors/custom.error";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class GetAdminTransactionDetailsUseCase {
  async execute(transactionUuid: string): Promise<any> {
    if (!transactionUuid) {
      throw new CustomError("ID da transação é obrigatório", 400);
    }

    // Buscar a transação com os relacionamentos básicos
    const transaction = await prismaClient.transactions.findUnique({
      where: { uuid: transactionUuid },
      include: {
        UserItem: {
          include: {
            UserInfo: true,
          },
        },
        BusinessInfo: true,
      },
    });

    if (!transaction) {
      throw new CustomError("Transação não encontrada", 404);
    }

    // Buscar PartnerCredit associado (caso a transação seja pós-paga)
    const partnerCredit = await prismaClient.partnerCredit.findFirst({
      where: { original_transaction_uuid: transactionUuid },
    });

    // Buscar eventos no BusinessAccountHistory associados a esta transação
    const businessHistory = await prismaClient.businessAccountHistory.findMany({
      where: { related_transaction_uuid: transactionUuid },
      orderBy: { created_at: "asc" },
    });

    // Montar o objeto de resposta
    const response = {
      header: {
        uuid: transaction.uuid,
        status: transaction.status,
        type: transaction.transaction_type,
        created_at: transaction.created_at,
        paid_at: transaction.paid_at,
        provider_tx_id: transaction.provider_tx_id,
        description: transaction.description
      },
      financials: {
        original_price: transaction.original_price,
        net_price: transaction.net_price,
        platform_fee: transaction.platform_net_fee_amount,
        cashback: transaction.cashback,
      },
      payer: transaction.UserItem ? {
        name: transaction.UserItem.UserInfo?.full_name || "Não informado",
        document: transaction.UserItem.UserInfo?.document || "Não informado",
        email: transaction.UserItem.UserInfo?.email || "Não informado",
        user_uuid: transaction.UserItem.UserInfo?.uuid,
        wallet_uuid: transaction.UserItem.uuid,
      } : null,
      payee: transaction.BusinessInfo ? {
        name: transaction.BusinessInfo.fantasy_name || transaction.BusinessInfo.corporate_reason,
        document: transaction.BusinessInfo.document,
        business_uuid: transaction.BusinessInfo.uuid,
      } : null,
      accounting: {
        type: partnerCredit ? "POST_PAID_CREDIT" : "IMMEDIATE_BALANCE",
        partner_credit: partnerCredit ? {
          uuid: partnerCredit.uuid,
          status: partnerCredit.status,
          balance: partnerCredit.balance,
          spent_amount: partnerCredit.spent_amount,
          availability_date: partnerCredit.availability_date,
        } : null,
        history_events: businessHistory.map((h) => ({
          uuid: h.uuid,
          event_type: h.event_type,
          amount: h.amount,
          previous_balance: h.balance_before,
          new_balance: h.balance_after,
          created_at: h.created_at,
        })),
      },
    };

    return response;
  }
}

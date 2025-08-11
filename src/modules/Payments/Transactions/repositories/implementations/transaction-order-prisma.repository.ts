import { randomUUID } from "node:crypto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../transaction-order.repository";
import { BusinessAccountEventType, CorrectAccountEventType, UserItemEventType } from "@prisma/client";
import { CalculateSplitPrePaidOutput } from "../../../../../paymentSplit/prePaidSplit";
import { CustomError } from "../../../../../errors/custom.error";
import { calculateCycleSettlementDateAsDate, newDateF } from "../../../../../utils/date";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class TransactionOrderPrismaRepository implements ITransactionOrderRepository {
  async generateTransactionReceiptDetails(transactionId: string): Promise<any> {
    const transaction = await prismaClient.transactions.findUnique({
      where: {
        uuid: transactionId
      },
      include: {
        UserInfo: {
          select: {
            full_name: true
          }
        },
        BusinessInfo: {
          select: {
            fantasy_name: true
          }
        }
      }
    })

    if (!transaction) return null

    return {
      uuid: new Uuid(transaction.uuid),
      user_item_uuid: transaction.user_item_uuid ? new Uuid(transaction.user_item_uuid) : null,
      favored_user_uuid: transaction.favored_user_uuid ? new Uuid(transaction.favored_user_uuid) : null,
      favored_business_info_uuid: transaction.favored_business_info_uuid ? new Uuid(transaction.favored_business_info_uuid) : null,
      original_price: transaction.original_price,
      fee_amount: transaction.fee_amount,
      cashback: transaction.cashback,
      description: transaction.description,
      status: transaction.status,
      transaction_type: transaction.transaction_type,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    } as TransactionEntity
  }
  async findBusinessAccountByBusinessInfoId(id: string): Promise<any> {
    const businessAccount = await prismaClient.businessAccount.findFirst({
      where: {
        business_info_uuid: id
      }
    })

    return businessAccount
  }

  async findCorrectAccount(): Promise<any> {
    const correctAccount = await prismaClient.correctAccount.findFirst()
    return correctAccount
  }

  async processSplitPrePaidPayment(
    transactionEntity: TransactionEntity,
    splitOutput: CalculateSplitPrePaidOutput,
    userInfoUuid: Uuid
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number, user_cashback_amount: number }> {
    // Extrair IDs e valores necessários para clareza
    const debitedUserItemId = transactionEntity.user_item_uuid?.uuid; // UUID do benefício que está sendo debitado
    const transactionId = transactionEntity.uuid.uuid;

    const favoredBusinessInfoId = transactionEntity.favored_business_info_uuid?.uuid;
    const totalAmountToDecrement = transactionEntity.net_price; // Valor total gasto pelo usuário
    const netAmountToCreditBusiness = splitOutput.partnerNetAmount;
    const netAmountToCreditPlatform = splitOutput.platformNetAmount;
    const cashbackAmountToCreditUser = splitOutput.userCashbackAmount; // Valor do cashback a ser creditado

    const result = await prismaClient.$transaction(async (tx) => {
      // 1. Buscar UserItem DEBITADO e verificar saldo atomicamente
      const debitedUserItem = await tx.userItem.findUnique({
        where: { uuid: debitedUserItemId },
        select: { balance: true, user_info_uuid: true } // Buscar saldo e ID do usuário
      });
      if (!debitedUserItem) {
        throw new CustomError(`Debited UserItem with UUID ${debitedUserItemId} not found.`, 404);
      }
      // Verificar se o item pertence ao usuário correto (segurança adicional)
      if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) {
        throw new CustomError(`Debited UserItem ${debitedUserItemId} does not belong to user ${userInfoUuid}.`, 409);
      }

      // Verificação atômica do saldo
      if (debitedUserItem.balance < totalAmountToDecrement) {
        throw new CustomError(`Insufficient balance in UserItem ${debitedUserItemId}. Required: ${totalAmountToDecrement}, Available: ${debitedUserItem.balance}`, 403);
      }
      const debitedUserItemBalanceBefore = debitedUserItem.balance;
      const debitedUserItemBalanceAfter = debitedUserItemBalanceBefore - totalAmountToDecrement;

      // 2. Buscar UserItem "Correct" para o cashback
      const correctUserItem = await tx.userItem.findFirst({
        where: {
          user_info_uuid: userInfoUuid.uuid, // Do mesmo usuário
          item_name: "Correct"       // Com o nome "Correct"
        },
        select: { uuid: true, balance: true }
      });

      if (!correctUserItem) {
        // Importante: O usuário PRECISA ter um item "Correct" para receber cashback
        throw new CustomError(`User ${userInfoUuid.uuid} does not have a 'Correct' UserItem to receive cashback.`, 404);
      }
      const correctUserItemId = correctUserItem.uuid;
      const correctItemBalanceBeforeCashback = correctUserItem.balance;
      const correctItemBalanceAfterCashback = correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

      // 3. Buscar saldo atual da BusinessAccount
      const currentBusinessAccount = await tx.businessAccount.findFirst({ // Usar findFirst pois a relação pode não ser unique no schema (embora devesse ser)
        where: { business_info_uuid: favoredBusinessInfoId }, // Busca pelo ID do BusinessInfo
        select: { uuid: true, balance: true } // Seleciona o UUID e o saldo
      });
      if (!currentBusinessAccount) {
        // Se a conta da empresa DEVE existir para a transação, lançar erro
        throw new CustomError(`BusinessAccount associated with BusinessInfo ${favoredBusinessInfoId} not found.`, 404);
      }
      const businessAccountId = currentBusinessAccount.uuid; // <<< Pega o UUID aqui
      const businessBalanceBefore = currentBusinessAccount.balance;
      const businessBalanceAfter = businessBalanceBefore + netAmountToCreditBusiness;

      // 4. Buscar CorrectAccount (assumindo que só existe uma)
      const currentCorrectAccount = await tx.correctAccount.findFirst({ // findFirst pois não há ID único óbvio para buscar
        select: { uuid: true, balance: true } // Seleciona o UUID e o saldo
      });
      if (!currentCorrectAccount) {
        // A conta da plataforma DEVE existir
        throw new CustomError(`CorrectAccount not found. System configuration error.`, 500);
      }
      const correctAccountId = currentCorrectAccount.uuid; // <<< Pega o UUID aqui
      const correctBalanceBefore = currentCorrectAccount.balance;
      const correctBalanceAfter = correctBalanceBefore + netAmountToCreditPlatform;

      // --- Executar Atualizações ---

      // 5. Debitar UserItem DEBITADO
      await tx.userItem.update({
        where: { uuid: debitedUserItemId },
        data: { balance: { decrement: totalAmountToDecrement }, updated_at: transactionEntity.updated_at }
      });

      // 6. Creditar BusinessAccount
      await tx.businessAccount.update({
        where: { uuid: businessAccountId }, // Usa o ID buscado
        data: { balance: { increment: netAmountToCreditBusiness }, updated_at: transactionEntity.updated_at }
      });

      // 7. Creditar CorrectAccount
      await tx.correctAccount.update({
        where: { uuid: correctAccountId }, // Usa o ID buscado
        data: { balance: { increment: netAmountToCreditPlatform }, updated_at: transactionEntity.updated_at }
      });
      // 8. Creditar CASHBACK no UserItem "Correct"
      await tx.userItem.update({
        where: { uuid: correctUserItemId },
        data: { balance: { increment: cashbackAmountToCreditUser }, updated_at: transactionEntity.updated_at }
      });
      // 9. Histórico GASTO UserItem DEBITADO
      await tx.userItemHistory.create({
        data: {
          user_item_uuid: debitedUserItemId,
          event_type: UserItemEventType.ITEM_SPENT,
          amount: -totalAmountToDecrement,
          balance_before: debitedUserItemBalanceBefore,
          balance_after: debitedUserItemBalanceAfter,
          related_transaction_uuid: transactionId,
        }
      });

      // 10. Histórico CASHBACK UserItem "Correct"
      await tx.userItemHistory.create({
        data: {
          user_item_uuid: correctUserItemId,
          event_type: UserItemEventType.CASHBACK_RECEIVED,
          amount: cashbackAmountToCreditUser,
          balance_before: correctItemBalanceBeforeCashback,
          balance_after: correctItemBalanceAfterCashback,
          related_transaction_uuid: transactionId,
        }
      });

      // 11. Histórico BusinessAccount
      await tx.businessAccountHistory.create({
        data: {
          business_account_uuid: businessAccountId, // Usa o ID buscado
          event_type: BusinessAccountEventType.PAYMENT_RECEIVED,
          amount: netAmountToCreditBusiness,
          balance_before: businessBalanceBefore,
          balance_after: businessBalanceAfter,
          related_transaction_uuid: transactionId,
        }
      });

      // 12. Histórico CorrectAccount
      await tx.correctAccountHistory.create({
        data: {
          correct_account_uuid: correctAccountId, // Usa o ID buscado
          event_type: CorrectAccountEventType.PLATFORM_FEE_COLLECTED,
          amount: netAmountToCreditPlatform,
          balance_before: correctBalanceBefore,
          balance_after: correctBalanceAfter,
          related_transaction_uuid: transactionId,
        }
      });

      // 13. Atualizar Status da Transação Original
      await tx.transactions.update({
        where: { uuid: transactionId },
        data: {
          status: "success",
          cashback: cashbackAmountToCreditUser,
          fee_amount: splitOutput.platformGrossAmount,
          user_item_uuid: debitedUserItemId,
          favored_business_info_uuid: favoredBusinessInfoId,
          updated_at: transactionEntity.updated_at
        }
      });


      // Retornar sucesso e o saldo final do item DEBITADO
      return {
        success: true,
        finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
        user_cashback_amount: cashbackAmountToCreditUser
      };


    }); // Fim do $transaction

    return { success: result.success, finalDebitedUserItemBalance: result.finalDebitedUserItemBalance, user_cashback_amount: cashbackAmountToCreditUser }; // Retorna o resultado da transação
  }
  async processSplitPrePaidPaymentTest(
    transactionEntity: TransactionEntity,
    userInfoUuid: Uuid
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number, user_cashback_amount: number }> {
    const dataToSave = transactionEntity.toJSON()
    // Extrair IDs e valores necessários para clareza
    const debitedUserItemId = dataToSave.user_item_uuid; // UUID do benefício que está sendo debitado
    const transactionId = dataToSave.uuid;

    const favoredBusinessInfoId = dataToSave.favored_business_info_uuid;
    const totalAmountToDecrement = dataToSave.net_price; // Valor total gasto pelo usuário
    const netAmountToCreditBusiness = dataToSave.partner_credit_amount;
    const netAmountToCreditPlatform = dataToSave.fee_amount;
    const cashbackAmountToCreditUser = dataToSave.cashback; // Valor do cashback a ser creditado



    const result = await prismaClient.$transaction(async (tx) => {
      // 1. Buscar UserItem DEBITADO e verificar saldo atomicamente
      const debitedUserItem = await tx.userItem.findUnique({
        where: { uuid: debitedUserItemId },
        select: { balance: true, user_info_uuid: true } // Buscar saldo e ID do usuário
      });
      if (!debitedUserItem) {
        throw new CustomError(`Debited UserItem with UUID ${debitedUserItemId} not found.`, 404);
      }
      // Verificar se o item pertence ao usuário correto (segurança adicional)
      if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) {
        throw new CustomError(`Debited UserItem ${debitedUserItemId} does not belong to user ${userInfoUuid}.`, 409);
      }

      // Verificação atômica do saldo
      if (debitedUserItem.balance < totalAmountToDecrement) {
        throw new CustomError(`Insufficient balance in UserItem ${debitedUserItemId}. Required: ${totalAmountToDecrement}, Available: ${debitedUserItem.balance}`, 403);
      }
      const debitedUserItemBalanceBefore = debitedUserItem.balance;
      const debitedUserItemBalanceAfter = debitedUserItemBalanceBefore - totalAmountToDecrement;

      // 2. Buscar UserItem "Correct" para o cashback
      const correctUserItem = await tx.userItem.findFirst({
        where: {
          user_info_uuid: userInfoUuid.uuid, // Do mesmo usuário
          item_name: "Correct"       // Com o nome "Correct"
        },
        select: { uuid: true, balance: true }
      });

      if (!correctUserItem) {
        // Importante: O usuário PRECISA ter um item "Correct" para receber cashback
        throw new CustomError(`User ${userInfoUuid.uuid} does not have a 'Correct' UserItem to receive cashback.`, 404);
      }
      const correctUserItemId = correctUserItem.uuid;
      const correctItemBalanceBeforeCashback = correctUserItem.balance;
      const correctItemBalanceAfterCashback = correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

      // 3. Buscar saldo atual da BusinessAccount
      const currentBusinessAccount = await tx.businessAccount.findFirst({ // Usar findFirst pois a relação pode não ser unique no schema (embora devesse ser)
        where: { business_info_uuid: favoredBusinessInfoId }, // Busca pelo ID do BusinessInfo
        select: { uuid: true, balance: true } // Seleciona o UUID e o saldo
      });
      if (!currentBusinessAccount) {
        // Se a conta da empresa DEVE existir para a transação, lançar erro
        throw new CustomError(`BusinessAccount associated with BusinessInfo ${favoredBusinessInfoId} not found.`, 404);
      }
      const businessAccountId = currentBusinessAccount.uuid; // <<< Pega o UUID aqui
      const businessBalanceBefore = currentBusinessAccount.balance;
      const businessBalanceAfter = businessBalanceBefore + netAmountToCreditBusiness;

      // 4. Buscar CorrectAccount (assumindo que só existe uma)
      const currentCorrectAccount = await tx.correctAccount.findFirst({ // findFirst pois não há ID único óbvio para buscar
        select: { uuid: true, balance: true } // Seleciona o UUID e o saldo
      });
      if (!currentCorrectAccount) {
        // A conta da plataforma DEVE existir
        throw new CustomError(`CorrectAccount not found. System configuration error.`, 500);
      }
      const correctAccountId = currentCorrectAccount.uuid; // <<< Pega o UUID aqui
      const correctBalanceBefore = currentCorrectAccount.balance;
      const correctBalanceAfter = correctBalanceBefore + netAmountToCreditPlatform;

      // --- Executar Atualizações ---

      // 5. Debitar UserItem DEBITADO
      await tx.userItem.update({
        where: { uuid: debitedUserItemId },
        data: { balance: { decrement: totalAmountToDecrement }, updated_at: transactionEntity.updated_at }
      });

      // 6. Creditar BusinessAccount
      await tx.businessAccount.update({
        where: { uuid: businessAccountId }, // Usa o ID buscado
        data: { balance: { increment: netAmountToCreditBusiness }, updated_at: transactionEntity.updated_at }
      });

      // 7. Creditar CorrectAccount
      await tx.correctAccount.update({
        where: { uuid: correctAccountId }, // Usa o ID buscado
        data: { balance: { increment: netAmountToCreditPlatform }, updated_at: transactionEntity.updated_at }
      });
      // 8. Creditar CASHBACK no UserItem "Correct"
      await tx.userItem.update({
        where: { uuid: correctUserItemId },
        data: { balance: { increment: cashbackAmountToCreditUser }, updated_at: transactionEntity.updated_at }
      });

      // 9. Histórico GASTO UserItem DEBITADO
      await tx.userItemHistory.create({
        data: {
          user_item_uuid: debitedUserItemId,
          event_type: UserItemEventType.ITEM_SPENT,
          amount: -totalAmountToDecrement,
          balance_before: debitedUserItemBalanceBefore,
          balance_after: debitedUserItemBalanceAfter,
          related_transaction_uuid: transactionId,
        }
      });

      // 10. Histórico CASHBACK UserItem "Correct"
      await tx.userItemHistory.create({
        data: {
          user_item_uuid: correctUserItemId,
          event_type: UserItemEventType.CASHBACK_RECEIVED,
          amount: cashbackAmountToCreditUser,
          balance_before: correctItemBalanceBeforeCashback,
          balance_after: correctItemBalanceAfterCashback,
          related_transaction_uuid: transactionId,
        }
      });

      // 11. Histórico BusinessAccount
      await tx.businessAccountHistory.create({
        data: {
          business_account_uuid: businessAccountId, // Usa o ID buscado
          event_type: BusinessAccountEventType.PAYMENT_RECEIVED,
          amount: netAmountToCreditBusiness,
          balance_before: businessBalanceBefore,
          balance_after: businessBalanceAfter,
          related_transaction_uuid: transactionId,
        }
      });

      // 12. Histórico CorrectAccount
      await tx.correctAccountHistory.create({
        data: {
          correct_account_uuid: correctAccountId, // Usa o ID buscado
          event_type: CorrectAccountEventType.PLATFORM_FEE_COLLECTED,
          amount: netAmountToCreditPlatform,
          balance_before: correctBalanceBefore,
          balance_after: correctBalanceAfter,
          related_transaction_uuid: transactionId,
        }
      });

      // 13. Atualizar Status da Transação Original
      await tx.transactions.update({
        where: { uuid: transactionId },
        data: {
          status: "success",
          // Apenas atualizamos o que muda no final do processamento
          paid_at: newDateF(new Date()),
          updated_at: newDateF(new Date())
        }
      });


      // Retornar sucesso e o saldo final do item DEBITADO
      return {
        success: true,
        finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
        user_cashback_amount: cashbackAmountToCreditUser
      };


    }); // Fim do $transaction

    return { success: result.success, finalDebitedUserItemBalance: result.finalDebitedUserItemBalance, user_cashback_amount: cashbackAmountToCreditUser }; // Retorna o resultado da transação
  }

  // Dentro da sua classe de implementação do ITransactionOrderRepository

  async processSplitPostPaidPayment(
    transactionEntity: TransactionEntity,
    userInfoUuid: Uuid
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number, user_cashback_amount: number }> {

    // 1. Extração de Dados da Entidade (em centavos)
    const dataToSave = transactionEntity.toJSON();
    const debitedUserItemId = dataToSave.user_item_uuid;
    const transactionId = dataToSave.uuid;
    const favoredBusinessInfoId = dataToSave.favored_business_info_uuid;
    const totalAmountToDecrement = dataToSave.net_price;
    const netAmountToCreateAsCredit = dataToSave.partner_credit_amount;
    const netAmountToCreditPlatform = dataToSave.fee_amount;
    const cashbackAmountToCreditUser = dataToSave.cashback;

    // 2. Início da Transação Atômica
    const result = await prismaClient.$transaction(async (tx) => {

      // 2.1. Leitura e Validação do Benefício a ser Debitado (Limite de Crédito)
      const debitedUserItem = await tx.userItem.findUnique({
        where: { uuid: debitedUserItemId },
        select: { balance: true, user_info_uuid: true }
      });
      if (!debitedUserItem) { throw new CustomError(`Benefício (UUID: ${debitedUserItemId}) não encontrado.`, 404); }
      if (debitedUserItem.user_info_uuid !== userInfoUuid.uuid) { throw new CustomError(`O benefício ${debitedUserItemId} não pertence ao usuário.`, 403); }
      if (debitedUserItem.balance < totalAmountToDecrement) { throw new CustomError(`Limite de crédito insuficiente no benefício.`, 403); }

      const debitedUserItemBalanceBefore = debitedUserItem.balance;
      const debitedUserItemBalanceAfter = debitedUserItemBalanceBefore - totalAmountToDecrement;

      // 2.2. Leitura da Carteira de Cashback "Correct"
      const correctUserItem = await tx.userItem.findFirst({
        where: {
          user_info_uuid: userInfoUuid.uuid,
          item_name: "Correct"
        },
        select: { uuid: true, balance: true }
      });
      if (!correctUserItem) { throw new CustomError(`Carteira 'Correct' do usuário não encontrada para receber cashback.`, 404); }

      const correctUserItemId = correctUserItem.uuid;
      const correctItemBalanceBeforeCashback = correctUserItem.balance;
      const correctItemBalanceAfterCashback = correctItemBalanceBeforeCashback + cashbackAmountToCreditUser;

      // 2.3. Leitura da Conta do Parceiro (para obter o UUID de referência)
      const partnerBusinessAccount = await tx.businessAccount.findFirst({
        where: { business_info_uuid: favoredBusinessInfoId },
        select: { uuid: true }
      });
      if (!partnerBusinessAccount) { throw new CustomError(`Conta do parceiro (BusinessInfo: ${favoredBusinessInfoId}) não encontrada.`, 404); }
      const partnerBusinessAccountId = partnerBusinessAccount.uuid;

      // 2.4. Leitura da Conta da Plataforma
      const currentCorrectAccount = await tx.correctAccount.findFirst({
        select: { uuid: true, balance: true }
      });
      if (!currentCorrectAccount) { throw new CustomError(`Conta da plataforma 'Correct' não encontrada. Erro de sistema.`, 500); }

      const correctAccountId = currentCorrectAccount.uuid;
      const correctBalanceBefore = currentCorrectAccount.balance;
      const correctBalanceAfter = correctBalanceBefore + netAmountToCreditPlatform;

      // --- 3. Execução das Operações de Escrita ---

      // 3.1. Debitar o limite do benefício do usuário
      await tx.userItem.update({
        where: { uuid: debitedUserItemId },
        data: { balance: { decrement: totalAmountToDecrement } }
      });

      // 3.2. Creditar a taxa na conta da Correct
      await tx.correctAccount.update({
        where: { uuid: correctAccountId },
        data: { balance: { increment: netAmountToCreditPlatform } }
      });

      // 3.3. Creditar o cashback na carteira "Correct" do usuário
      await tx.userItem.update({
        where: { uuid: correctUserItemId },
        data: { balance: { increment: cashbackAmountToCreditUser } }
      });

      // 3.4. PONTO CHAVE: Criar o registro de Crédito para o Parceiro com a nova lógica de ciclo
      const settlementDate = calculateCycleSettlementDateAsDate(new Date());

      await tx.partnerCredit.create({
        data: {
          business_account_uuid: partnerBusinessAccountId,
          original_transaction_uuid: transactionId,
          balance: netAmountToCreateAsCredit,
          spent_amount: 0,
          status: "PENDING",
          availability_date: settlementDate, // Passando o objeto Date, como recomendado
        }
      });

      // --- 4. Criação dos Registros de Histórico ---

      // 4.1. Históricos de débito e cashback do usuário
      await tx.userItemHistory.createMany({
        data: [
          { user_item_uuid: debitedUserItemId, event_type: "ITEM_SPENT", amount: -totalAmountToDecrement, balance_before: debitedUserItemBalanceBefore, balance_after: debitedUserItemBalanceAfter, related_transaction_uuid: transactionId },
          { user_item_uuid: correctUserItemId, event_type: "CASHBACK_RECEIVED", amount: cashbackAmountToCreditUser, balance_before: correctItemBalanceBeforeCashback, balance_after: correctItemBalanceAfterCashback, related_transaction_uuid: transactionId }
        ]
      });

      // 4.2. Histórico da taxa da plataforma
      await tx.correctAccountHistory.create({
        data: { correct_account_uuid: correctAccountId, event_type: "PLATFORM_FEE_COLLECTED", amount: netAmountToCreditPlatform, balance_before: correctBalanceBefore, balance_after: correctBalanceAfter, related_transaction_uuid: transactionId }
      });

      // 4.3. Atualizar a transação principal para "success"
      await tx.transactions.update({
        where: { uuid: transactionId },
        data: { status: "success", paid_at: newDateF(new Date()), updated_at: newDateF(new Date()) }
      });

      // 5. Retorno
      return {
        success: true,
        finalDebitedUserItemBalance: debitedUserItemBalanceAfter,
        user_cashback_amount: cashbackAmountToCreditUser
      };
    });

    return result;
  }


  async savePOSTransaction(entity: TransactionEntity): Promise<TransactionEntity> {
    const dataToSave = entity.toJSON()

    const transaction = await prismaClient.transactions.create({
      data: {
        uuid: dataToSave.uuid,
        user_item_uuid: null,
        favored_user_uuid: null,
        favored_business_info_uuid: dataToSave.favored_business_info_uuid,
        original_price: dataToSave.original_price,
        discount_percentage: dataToSave.discount_percentage,
        net_price: dataToSave.net_price,
        fee_percentage: dataToSave.fee_percentage,
        partner_credit_amount: dataToSave.partner_credit_amount,
        fee_amount: dataToSave.fee_amount,
        cashback: dataToSave.cashback,
        description: dataToSave.description,
        status: dataToSave.status,
        transaction_type: dataToSave.transaction_type,
        favored_partner_user_uuid: dataToSave.favored_partner_user_uuid,
        paid_at: null,
        created_at: dataToSave.created_at,
      }
    })

    return {
      uuid: new Uuid(transaction.uuid),
      user_item_uuid: transaction.user_item_uuid ? new Uuid(transaction.user_item_uuid) : null,
      favored_user_uuid: transaction.favored_user_uuid ? new Uuid(transaction.favored_user_uuid) : null,
      favored_business_info_uuid: transaction.favored_business_info_uuid ? new Uuid(transaction.favored_business_info_uuid) : null,
      original_price: transaction.original_price,
      discount_percentage: transaction.discount_percentage,
      net_price: transaction.net_price,
      fee_percentage: transaction.fee_percentage,
      fee_amount: transaction.fee_amount,
      cashback: transaction.cashback,
      description: transaction.description,
      status: transaction.status,
      transaction_type: transaction.transaction_type,
      favored_partner_user_uuid: transaction.favored_partner_user_uuid ? new Uuid(transaction.favored_partner_user_uuid) : null,
      paid_at: transaction.paid_at,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    } as TransactionEntity
  }
  async find(id: Uuid): Promise<TransactionEntity | null> {
    const transaction = await prismaClient.transactions.findUnique({
      where: {
        uuid: id.uuid
      }
    })

    if (!transaction) return null

    return {
      uuid: new Uuid(transaction.uuid),
      user_item_uuid: transaction.user_item_uuid ? new Uuid(transaction.user_item_uuid) : null,
      favored_user_uuid: transaction.favored_user_uuid ? new Uuid(transaction.favored_user_uuid) : null,
      favored_business_info_uuid: transaction.favored_business_info_uuid ? new Uuid(transaction.favored_business_info_uuid) : null,
      original_price: transaction.original_price,
      discount_percentage: transaction.discount_percentage,
      net_price: transaction.net_price,
      fee_percentage: transaction.fee_percentage,
      fee_amount: transaction.fee_amount,
      cashback: transaction.cashback,
      partner_credit_amount: transaction.partner_credit_amount,
      description: transaction.description,
      status: transaction.status,
      transaction_type: transaction.transaction_type,
      favored_partner_user_uuid: transaction.favored_partner_user_uuid ? new Uuid(transaction.favored_partner_user_uuid) : null,
      paid_at: transaction.paid_at,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    } as TransactionEntity
  }

  create(entity: TransactionEntity): Promise<void> {
    throw new CustomError("Method not implemented.");
  }
  update(entity: TransactionEntity): Promise<void> {
    throw new CustomError("Method not implemented.");
  }

  findAll(): Promise<TransactionEntity[]> {
    throw new CustomError("Method not implemented.");
  }

}

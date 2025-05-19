import { randomUUID } from "node:crypto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../transaction-order.repository";
import { BusinessAccountEventType, CorrectAccountEventType, UserItemEventType } from "@prisma/client";
import { CalculateSplitPrePaidOutput } from "../../../../../paymentSplit/prePaidSplit";
import { CustomError } from "../../../../../errors/custom.error";

export class TransactionOrderPrismaRepository implements ITransactionOrderRepository {
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
  // async processSplitPrePaidPayment(transactionEntity: TransactionEntity, userItemEntity: AppUserItemEntity): Promise<any> {
  //   const [userItem, businessAccount] = await prismaClient.$transaction([
  //     //remove the amount from user item
  //     prismaClient.userItem.update({
  //       where: {
  //         uuid: transactionEntity.user_item_uuid.uuid
  //       },
  //       data: {
  //         balance: {
  //           decrement: transactionEntity.amount
  //         },
  //         updated_at: transactionEntity.updated_at
  //       }
  //     }),
  //     //add net amount to business account
  //     prismaClient.businessAccount.update({
  //       where: {
  //         uuid: transactionEntity.favored_business_info_uuid.uuid
  //       },
  //       data: {
  //         balance: {
  //           increment: transactionEntity.business_account_amount
  //         },
  //         updated_at: transactionEntity.updated_at
  //       }
  //     }),
  //     //add net amount to correct account
  //     prismaClient.correctAccount.update({
  //       where: {
  //         uuid: transactionEntity.correct_account_uuid.uuid
  //       },
  //       data: {
  //         balance: {
  //           increment: transactionEntity.platform_net_amount
  //         },
  //         updated_at: transactionEntity.updated_at
  //       }
  //     }),
  //     //update the transaction status
  //     prismaClient.transactions.update({
  //       where: {
  //         uuid: transactionEntity.uuid.uuid
  //       },
  //       data: {
  //         status: transactionEntity.status,
  //         updated_at: transactionEntity.updated_at
  //       },
  //     }),
  //     //create user item history
  //     prismaClient.userItemHistory.create({
  //       data: {
  //         uuid: randomUUID(),
  //         user_item_uuid: transactionEntity.user_item_uuid.uuid,
  //         event_type: "ITEM_SPENT",
  //         amount: transactionEntity.amount,
  //         balance_before: userItemEntity.balance,
  //         balance_after: userItemEntity.balance - transactionEntity.amount,
  //         related_transaction_uuid: transactionEntity.uuid.uuid,
  //         description: transactionEntity.description,
  //         created_at: transactionEntity.created_at,
  //       },
  //     }),
  //     //set cashback to user debit benefit
  //     prismaClient.userItem.update({
  //       where: {
  //         uuid: transactionEntity.user_debit_benefit_uuid.uuid
  //       },
  //       data: {
  //         balance: {
  //           increment: transactionEntity.cashback
  //         },
  //         updated_at: transactionEntity.updated_at
  //       }
  //     }),
  //     //create cashback history
  //     prismaClient.userItemHistory.create({
  //       data:{
  //         uuid: randomUUID(),
  //         user_item_uuid: transactionEntity.user_debit_benefit_uuid.uuid,
  //         event_type: "CASHBACK_RECEIVED",
  //         amount: transactionEntity.cashback,
  //         balance_before: transactionEntity.user_debit_benefit_balance,
  //         balance_after: transactionEntity.user_debit_benefit_balance + transactionEntity.cashback,
  //         related_transaction_uuid: transactionEntity.uuid.uuid,
  //         description: transactionEntity.description,
  //         created_at: transactionEntity.created_at,
  //       }
  //     }),
  //     //create business account history
  //     prismaClient.businessAccountHistory.create({
  //       data: {
  //         uuid: randomUUID(),
  //         business_account_uuid: transactionEntity.business_account_uuid.uuid,
  //         amount: transactionEntity.business_account_amount,
  //         balance_before: transactionEntity.business_account_balance,
  //         balance_after: transactionEntity.business_account_balance + transactionEntity.business_account_amount,
  //         related_transaction_uuid: transactionEntity.uuid.uuid,
  //         event_type: "PAYMENT_RECEIVED",
  //         description: transactionEntity.description,
  //         created_at: transactionEntity.created_at,
  //       }
  //     }),
  //     //create correct account history
  //     prismaClient.correctAccountHistory.create({
  //       data: {
  //         uuid: randomUUID(),
  //         correct_account_uuid: transactionEntity.correct_account_uuid.uuid,
  //         event_type: "PLATFORM_FEE_COLLECTED",
  //         amount: transactionEntity.platform_net_amount,
  //         balance_before: transactionEntity.correct_account_balance,
  //         balance_after: transactionEntity.correct_account_balance + transactionEntity.platform_net_amount,
  //         description: transactionEntity.description,
  //         related_transaction_uuid: transactionEntity.uuid.uuid,
  //         created_at: transactionEntity.created_at,
  //       }
  //     })

  //   ])
  // }
  // async processPrePaidPayment(entity: TransactionEntity): Promise<TransactionEntity> {
  //   const transaction = await prismaClient.transactions.update({
  //     where: {
  //       uuid: entity.uuid.uuid
  //     },
  //     data: {
  //       user_item_uuid: entity.user_item_uuid.uuid,
  //       description: entity.description,
  //       updated_at: entity.updated_at,
  //     }
  //   })
  //   return {
  //     uuid: new Uuid(transaction.uuid),
  //     user_item_uuid: transaction.user_item_uuid ? new Uuid(transaction.user_item_uuid) : null,
  //     favored_user_uuid: transaction.favored_user_uuid ? new Uuid(transaction.favored_user_uuid) : null,
  //     favored_business_info_uuid: transaction.favored_business_info_uuid ? new Uuid(transaction.favored_business_info_uuid) : null,
  //     amount: transaction.amount,
  //     fee_amount: transaction.fee_amount,
  //     cashback: transaction.cashback,
  //     description: transaction.description,
  //     status: transaction.status,
  //     transaction_type: transaction.transaction_type,
  //     created_at: transaction.created_at,
  //     updated_at: transaction.updated_at
  //   } as TransactionEntity
  // }

  async processSplitPrePaidPayment(
    transactionEntity: TransactionEntity,
    splitOutput: CalculateSplitPrePaidOutput,
    userInfoUuid: Uuid
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number}> {
    // Extrair IDs e valores necessários para clareza
    const debitedUserItemId = transactionEntity.user_item_uuid?.uuid; // UUID do benefício que está sendo debitado
    const transactionId = transactionEntity.uuid.uuid;

    const favoredBusinessInfoId = transactionEntity.favored_business_info_uuid?.uuid;
    const totalAmountToDecrement = transactionEntity.amount; // Valor total gasto pelo usuário
    const netAmountToCreditBusiness = splitOutput.partnerNetAmount;
    const netAmountToCreditPlatform = splitOutput.platformNetAmount;
    const cashbackAmountToCreditUser = splitOutput.userCashbackAmount * 100; // Valor do cashback a ser creditado

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
        data: { balance: { decrement: totalAmountToDecrement * 100}, updated_at: transactionEntity.updated_at }
      });

      // 6. Creditar BusinessAccount
      await tx.businessAccount.update({
        where: { uuid: businessAccountId }, // Usa o ID buscado
        data: { balance: { increment: netAmountToCreditBusiness * 100}, updated_at: transactionEntity.updated_at }
      });

      // 7. Creditar CorrectAccount
      await tx.correctAccount.update({
        where: { uuid: correctAccountId }, // Usa o ID buscado
        data: { balance: { increment: netAmountToCreditPlatform * 100}, updated_at: transactionEntity.updated_at }
      });
      console.log({cashbackAmountToCreditUser})
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
        finalDebitedUserItemBalance: debitedUserItemBalanceAfter
      };


    }); // Fim do $transaction

    return result; // Retorna o resultado da transação
  }
  async save(entity: TransactionEntity): Promise<TransactionEntity> {
    const transaction = await prismaClient.transactions.create({
      data: {
        uuid: entity.uuid.uuid,
        user_item_uuid: entity.user_item_uuid ? entity.user_item_uuid.uuid : null,
        favored_user_uuid: entity.favored_user_uuid ? entity.favored_user_uuid.uuid : null,
        favored_business_info_uuid: entity.favored_business_info_uuid ? entity.favored_business_info_uuid.uuid : null,
        amount: entity.amount,
        fee_amount: entity.fee_amount,
        cashback: entity.cashback,
        description: entity.description,
        status: entity.status,
        transaction_type: entity.transaction_type,
        partner_user_uuid: entity.partner_user_uuid ? entity.partner_user_uuid.uuid : null,
        created_at: entity.created_at,
        updated_at: entity.updated_at
      }
    })

    return {
      uuid: new Uuid(transaction.uuid),
      user_item_uuid: transaction.user_item_uuid ? new Uuid(transaction.user_item_uuid) : null,
      favored_user_uuid: transaction.favored_user_uuid ? new Uuid(transaction.favored_user_uuid) : null,
      favored_business_info_uuid: transaction.favored_business_info_uuid ? new Uuid(transaction.favored_business_info_uuid) : null,
      amount: transaction.amount,
      fee_amount: transaction.fee_amount,
      cashback: transaction.cashback,
      description: transaction.description,
      status: transaction.status,
      transaction_type: transaction.transaction_type,
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
      amount: transaction.amount,
      fee_amount: transaction.fee_amount,
      cashback: transaction.cashback,
      description: transaction.description,
      status: transaction.status,
      transaction_type: transaction.transaction_type,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    } as TransactionEntity
  }
  findAll(): Promise<TransactionEntity[]> {
    throw new CustomError("Method not implemented.");
  }

}

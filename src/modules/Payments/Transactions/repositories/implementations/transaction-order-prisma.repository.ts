import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { AppUserItemEntity } from "../../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TransactionEntity } from "../../entities/transaction-order.entity";
import { ITransactionOrderRepository } from "../transaction-order.repository";

export class TransactionOrderPrismaRepository implements ITransactionOrderRepository {
  async processPrePaidPayment(transactionEntity: TransactionEntity, userItemEntity: AppUserItemEntity): Promise<any> {
    // const [userItem, businessAccount] = await prismaClient.$transaction([
    //   prismaClient.userItem.update({
    //     where:{
    //       uuid: userItemEntity.uuid.uuid
    //     },
    //     data:{
    //       balance: userItemEntity.balance,
    //       updated_at: userItemEntity.updated_at
    //     }
    //   }),
    //   prismaClient.

    // ])
  }
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
    throw new Error("Method not implemented.");
  }
  update(entity: TransactionEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async find(id: Uuid): Promise<TransactionEntity | null> {
    const transaction = await prismaClient.transactions.findUnique({
      where: {
        uuid: id.uuid
      }
    })

    if(!transaction) return null

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
    throw new Error("Method not implemented.");
  }

}

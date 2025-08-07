import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CalculateSplitPrePaidOutput } from "../../../../paymentSplit/prePaidSplit";
import { AppUserItemEntity } from "../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TransactionEntity } from "../entities/transaction-order.entity";

export interface ITransactionOrderRepository extends RepositoryInterface<TransactionEntity> {
  savePOSTransaction(entity: TransactionEntity): Promise<TransactionEntity>;
  processSplitPrePaidPayment(
    transactionEntity: TransactionEntity,
    splitOutput: CalculateSplitPrePaidOutput,
    userInfoUuid: Uuid
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number, user_cashback_amount: number }>;
  findCorrectAccount(): Promise<any>;
  findBusinessAccountByBusinessInfoId(id: string): Promise<any>;
  generateTransactionReceiptDetails(transactionId: string): Promise<any>
  processSplitPrePaidPaymentTest(
    transactionEntity: TransactionEntity,
    userInfoUuid: Uuid
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number, user_cashback_amount: number }>;
  processSplitPostPaidPayment(
    transactionEntity: TransactionEntity,
    userInfoUuid: Uuid // <<< Parâmetro adicionado
  ): Promise<{ success: boolean; finalDebitedUserItemBalance: number, user_cashback_amount: number }>
}

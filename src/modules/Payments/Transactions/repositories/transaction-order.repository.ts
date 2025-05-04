import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { AppUserItemEntity } from "../../../AppUser/AppUserManagement/entities/app-user-item.entity";
import { TransactionEntity } from "../entities/transaction-order.entity";

export interface ITransactionOrderRepository extends RepositoryInterface<TransactionEntity>  {
  save (entity: TransactionEntity): Promise<TransactionEntity>;
  processPrePaidPayment (transactionEntity: TransactionEntity, userItemEntity: AppUserItemEntity): Promise<any>;
}

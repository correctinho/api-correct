import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { TransactionEntity } from "../entities/transaction-order.entity";

export interface ITransactionOrderRepository extends RepositoryInterface<TransactionEntity>  {
  save (entity: TransactionEntity): Promise<TransactionEntity>;
}

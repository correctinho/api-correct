import { InputListTransactionsDto } from '../../application/usecases/dto/list-transactions.dto';

export interface IListTransactionsRepository {
  findAllPaginated(filters: InputListTransactionsDto): Promise<{ transactions: any[], total: number, total_platform_fee_cents: number }>;
}

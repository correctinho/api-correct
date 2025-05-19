import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { BusinessAccountEntity } from "../entities/business-account.entity";

export interface IBusinessAccountRepository extends RepositoryInterface<BusinessAccountEntity> {
  findByBusinessId(businessId: string): Promise<BusinessAccountEntity | null>;
}

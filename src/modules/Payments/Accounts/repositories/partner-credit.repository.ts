import { PartnerCreditEntity } from "../entities/partner-credit.entity";
import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";

export interface IPartnerCreditRepository extends RepositoryInterface<PartnerCreditEntity> {
    findAllByBusinessAccount(businessAccountId: string): Promise<PartnerCreditEntity[]>;
}
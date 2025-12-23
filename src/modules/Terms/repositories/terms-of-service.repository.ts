import RepositoryInterface from "../../../@shared/domain/repository/repository-interface";
import { TermsTypeEnum } from "../entities/enums/terms-type.enum";
import { TermsOfServiceEntity } from "../entities/terms-of-service.entity";

// Herda métodos padrão como find(uuid) e upsert(entity)
export interface ITermsOfServiceRepository extends RepositoryInterface<TermsOfServiceEntity> {
    findActiveByType(type: TermsTypeEnum): Promise<TermsOfServiceEntity | null>;

    deactivateAllOlderVersions(type: TermsTypeEnum): Promise<void>;
}
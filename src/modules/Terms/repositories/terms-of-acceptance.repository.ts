import RepositoryInterface from "../../../@shared/domain/repository/repository-interface";
import { TermAcceptanceEntity } from "../entities/term-acceptance.entity";

// Herda métodos padrão como find(uuid) e upsert(entity)
export interface ITermsOfAcceptanceRepository extends RepositoryInterface<TermAcceptanceEntity> {
}
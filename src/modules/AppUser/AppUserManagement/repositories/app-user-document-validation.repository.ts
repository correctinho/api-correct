import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { DocumentValidationEntity } from "../entities/app-user-document-validation.entity";

export interface IAppUserDocumentValidationRepository extends RepositoryInterface<DocumentValidationEntity>{
    saveOrUpdate(data: DocumentValidationEntity, user_info_uuid: Uuid): Promise<void>
    findStatuses(id: Uuid): Promise<DocumentValidationEntity>
}
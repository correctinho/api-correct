import RepositoryInterface from "../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { ServiceRequestEntity } from "../entities/ServiceRequest.entity";

export interface IServiceRequestRepository extends RepositoryInterface<ServiceRequestEntity> {
    findPendingByBusiness(businessUuid: Uuid): Promise<ServiceRequestEntity[]>
    countPendingByBusiness(businessUuid: Uuid): Promise<number>;
}
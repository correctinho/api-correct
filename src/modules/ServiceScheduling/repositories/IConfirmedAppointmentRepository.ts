import RepositoryInterface from "../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { ConfirmedAppointmentEntity } from "../entities/ConfirmedAppointment.entity";

export interface IConfirmedAppointmentRepository extends RepositoryInterface<ConfirmedAppointmentEntity> {
    confirm(serviceRequestUuid: Uuid, selectedSlotUuid: Uuid): Promise<ConfirmedAppointmentEntity>;
    findByRequestId(serviceRequestUuid: Uuid): Promise<ConfirmedAppointmentEntity | null>;
}
// O ID da solicitação vem pela URL (request_uuid)

import { ConfirmedAppointmentEntity } from "../../../../entities/ConfirmedAppointment.entity";

// O corpo da requisição traz qual slot foi escolhido.
export interface InputConfirmAppointmentDto {
    request_uuid: string;
    selected_slot_uuid: string;
}

export type OutputConfirmAppointmentDto = ConfirmedAppointmentEntity;
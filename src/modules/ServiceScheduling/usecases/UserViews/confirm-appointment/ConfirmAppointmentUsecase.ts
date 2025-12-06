import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { INotifierProvider } from "../../../../../infra/providers/NotifierProvider/INotifierProvider";
import { IConfirmedAppointmentRepository } from "../../../repositories/IConfirmedAppointmentRepository";
import { InputConfirmAppointmentDto, OutputConfirmAppointmentDto } from "./dto/ConfirmAppointment.dto";

export class ConfirmAppointmentUsecase {
    constructor(
        // Injeção de dependência do repositório transacional
        private confirmedAppointmentRepository: IConfirmedAppointmentRepository,
        // Injeção do provedor de notificações (n8n)
        private notifier: INotifierProvider
    ) {}

    async execute(input: InputConfirmAppointmentDto): Promise<OutputConfirmAppointmentDto> {
        // 1. Converter strings para Value Objects
        const requestUuidVo = new Uuid(input.request_uuid);
        const selectedSlotUuidVo = new Uuid(input.selected_slot_uuid);

        // 2. Chamar o repositório para executar a transação atômica
        // Se algo der errado lá dentro (validações ou banco), ele lançará um erro e parará aqui.
        const confirmedAppointment = await this.confirmedAppointmentRepository.confirm(
            requestUuidVo,
            selectedSlotUuidVo
        );

        // 3. Se chegou aqui, a transação foi um sucesso. Disparar notificação.
        // Este evento no n8n pode:
        // - Mandar push para o usuário: "Agendamento confirmado para [data]!"
        // - Mandar e-mail/push para o prestador: "Novo agendamento confirmado!"
        this.notifier.notify({
            event_type: 'APPOINTMENT_CONFIRMED',
            data: {
                appointmentId: confirmedAppointment.uuid.uuid,
                requestId: confirmedAppointment.serviceRequestUuid.uuid,
                scheduledDate: confirmedAppointment.startDatetime.toISOString()
            }
        });

        // 4. Retornar o agendamento confirmado
        return confirmedAppointment;
    }
}
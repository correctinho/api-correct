import { Request, Response } from 'express';
import { IConfirmedAppointmentRepository } from '../../../repositories/IConfirmedAppointmentRepository';
import { INotifierProvider } from '../../../../../infra/providers/NotifierProvider/INotifierProvider';
import { InputConfirmAppointmentDto } from './dto/ConfirmAppointment.dto';
import { ConfirmAppointmentUsecase } from './ConfirmAppointmentUsecase';
// Interfaces Abstratas (DIP)

export class ConfirmAppointmentController {
    // Injeção de dependências via construtor
    constructor(
        private confirmedAppointmentRepository: IConfirmedAppointmentRepository,
        private notifierProvider: INotifierProvider
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        // 1. Extrair dados
        const { requestId } = request.params; // Vem da URL: /:requestId/confirm
        const { selected_slot_uuid } = request.body; // Vem do corpo do JSON

        // Validação básica de entrada
        if (!requestId || !selected_slot_uuid) {
            return response.status(400).json({
                error: "ID da solicitação e ID do slot selecionado são obrigatórios."
            });
        }

        const inputDto: InputConfirmAppointmentDto = {
            request_uuid: requestId,
            selected_slot_uuid: selected_slot_uuid
        };

        // 2. Instanciar o UseCase com as dependências injetadas
        const usecase = new ConfirmAppointmentUsecase(
            this.confirmedAppointmentRepository,
            this.notifierProvider
        );

        // 3. Executar
        try {
            // A execução retorna a entidade do agendamento confirmado.
            // Podemos retorná-la para o front-end atualizar o estado local se necessário.
            const confirmedAppointment = await usecase.execute(inputDto);

            // Retorna 200 OK com os dados do agendamento
            // Usamos toJSON() para garantir a serialização correta da entidade
            return response.status(200).json(confirmedAppointment.toJSON());

        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            return response.status(statusCode).json({
                error: error.message || "Erro interno ao confirmar o agendamento."
            });
        }
    }
}
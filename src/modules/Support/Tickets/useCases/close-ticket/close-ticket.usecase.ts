import { ITicketsRepository } from "../../repositories/ITicketsRepository";
import { ISlackProvider } from "../../../../../infra/providers/SlackProvider/ISlackProvider";
import { Ticket, TicketStatus, MessageSenderType } from "@prisma/client";

export class CloseTicketUseCase {
    constructor(
        private ticketsRepository: ITicketsRepository,
        private slackProvider: ISlackProvider
    ) {}

    async execute(ticketUuid: string, closedByName: string, callerBusinessId?: string, callerAppUserId?: string, isAdmin?: boolean): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findById(ticketUuid);
        if (!ticket) {
            throw new Error("Chamado não encontrado.");
        }

        // Validação de acesso
        if (!isAdmin) {
            if (callerBusinessId && ticket.business_id && ticket.business_id !== callerBusinessId) {
                throw new Error("Você não tem permissão para encerrar este chamado.");
            }
            if (callerAppUserId && ticket.app_user_id && ticket.app_user_id !== callerAppUserId) {
                throw new Error("Você não tem permissão para encerrar este chamado.");
            }
        }

        const updatedTicket = await this.ticketsRepository.updateStatus(ticketUuid, TicketStatus.CLOSED);

        // Adiciona mensagem de encerramento do sistema
        await this.ticketsRepository.addMessage({
            ticket_uuid: ticketUuid,
            sender_type: MessageSenderType.SYSTEM,
            sender_name: "Sistema",
            message: `Chamado finalizado por ${closedByName}.`,
        });

        // Notifica na thread do Slack
        if (ticket.slack_channel_id && ticket.slack_thread_ts) {
            try {
                await this.slackProvider.postMessageToThread(
                    ticket.slack_channel_id,
                    ticket.slack_thread_ts,
                    `✅ *Chamado #${ticket.protocol} finalizado por ${closedByName}.*`
                );
            } catch (err) {
                console.error("[CloseTicketUseCase] Erro ao notificar encerramento no Slack:", err);
            }
        }

        return updatedTicket;
    }
}

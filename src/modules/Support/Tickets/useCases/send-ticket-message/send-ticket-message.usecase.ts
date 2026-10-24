import { ITicketsRepository } from "../../repositories/ITicketsRepository";
import { ISlackProvider } from "../../../../../infra/providers/SlackProvider/ISlackProvider";
import { MessageSenderType, TicketMessage, TicketStatus } from "@prisma/client";

export interface SendTicketMessageDTO {
    ticketUuid: string;
    senderName: string;
    message: string;
    attachments?: any;
    callerBusinessId?: string;
    callerAppUserId?: string;
    isAdmin?: boolean;
}

export class SendTicketMessageUseCase {
    constructor(
        private ticketsRepository: ITicketsRepository,
        private slackProvider: ISlackProvider
    ) {}

    async execute(dto: SendTicketMessageDTO): Promise<TicketMessage> {
        if (!dto.message || !dto.message.trim()) {
            throw new Error("A mensagem não pode ser vazia.");
        }

        const ticket = await this.ticketsRepository.findById(dto.ticketUuid);
        if (!ticket) {
            throw new Error("Chamado não encontrado.");
        }

        if (ticket.status === TicketStatus.CLOSED) {
            throw new Error("Este chamado já foi encerrado. Abra um novo chamado caso precise de suporte.");
        }

        // Validação de acesso
        if (!dto.isAdmin) {
            if (dto.callerBusinessId && ticket.business_id && ticket.business_id !== dto.callerBusinessId) {
                throw new Error("Você não tem permissão para responder a este chamado.");
            }
            if (dto.callerAppUserId && ticket.app_user_id && ticket.app_user_id !== dto.callerAppUserId) {
                throw new Error("Você não tem permissão para responder a este chamado.");
            }
        }

        const senderType = dto.isAdmin ? MessageSenderType.SUPPORT : MessageSenderType.CLIENT;

        // 1. Grava a mensagem no banco
        const ticketMessage = await this.ticketsRepository.addMessage({
            ticket_uuid: dto.ticketUuid,
            sender_type: senderType,
            sender_name: dto.senderName,
            message: dto.message,
            attachments: dto.attachments,
        });

        // 2. Atualiza status se estava respondido
        if (senderType === MessageSenderType.CLIENT && ticket.status !== TicketStatus.OPEN) {
            await this.ticketsRepository.updateStatus(ticket.uuid, TicketStatus.OPEN);
        }

        // 3. Posta na thread do Slack
        if (ticket.slack_channel_id && ticket.slack_thread_ts) {
            const formattedText = `💬 *Réplica de ${dto.senderName}:*\n>${dto.message.replace(/\n/g, "\n>")}`;
            try {
                await this.slackProvider.postMessageToThread(
                    ticket.slack_channel_id,
                    ticket.slack_thread_ts,
                    formattedText
                );
            } catch (err) {
                console.error("[SendTicketMessageUseCase] Erro ao replicar mensagem no Slack:", err);
            }
        }

        return ticketMessage;
    }
}

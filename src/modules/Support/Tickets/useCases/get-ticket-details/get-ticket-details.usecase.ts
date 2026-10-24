import { ITicketsRepository, TicketWithMessages } from "../../repositories/ITicketsRepository";
import { ISlackProvider } from "../../../../../infra/providers/SlackProvider/ISlackProvider";
import { MessageSenderType, TicketStatus } from "@prisma/client";

export class GetTicketDetailsUseCase {
    constructor(
        private ticketsRepository: ITicketsRepository,
        private slackProvider?: ISlackProvider
    ) {}

    async execute(ticketUuid: string, callerBusinessId?: string, callerAppUserId?: string, isAdmin?: boolean): Promise<TicketWithMessages> {
        let ticket = await this.ticketsRepository.findById(ticketUuid);

        if (!ticket) {
            throw new Error("Chamado não encontrado.");
        }

        // Validação de acesso (a menos que seja admin da Correct)
        if (!isAdmin) {
            if (callerBusinessId && ticket.business_id && ticket.business_id !== callerBusinessId) {
                throw new Error("Você não tem permissão para visualizar este chamado.");
            }
            if (callerAppUserId && ticket.app_user_id && ticket.app_user_id !== callerAppUserId) {
                throw new Error("Você não tem permissão para visualizar este chamado.");
            }
        }

        // Sincronização inteligente com thread do Slack caso o chamado esteja aberto
        if (this.slackProvider && ticket.slack_thread_ts && ticket.status !== TicketStatus.CLOSED) {
            try {
                const replies = await this.slackProvider.getThreadReplies(
                    ticket.slack_channel_id || "",
                    ticket.slack_thread_ts
                );

                const existingMessages = new Set((ticket.messages || []).map(m => m.message.trim()));
                let hasChanges = false;

                for (const reply of replies) {
                    // Ignora mensagem raiz ou mensagens do próprio bot
                    if (reply.ts === ticket.slack_thread_ts || reply.isBot) continue;

                    const text = reply.text.trim();
                    if (!text || existingMessages.has(text)) continue;

                    // Comando de encerramento pelo Slack
                    const isClosingCommand = /^(?:!|:|\/)?(?:encerrar|concluir|fechar|finalizar)/i.test(text);

                    if (isClosingCommand) {
                        const cleanMessage = text.replace(/^(?:!|:|\/)?(?:encerrar|concluir|fechar|finalizar)\s*[:-]?\s*/i, '').trim();
                        const messageToSave = cleanMessage || "Atendimento concluído pelo suporte.";

                        await this.ticketsRepository.addMessage({
                            ticket_uuid: ticket.uuid,
                            sender_type: MessageSenderType.SUPPORT,
                            sender_name: "Suporte SysCorrect",
                            message: messageToSave,
                        });
                        await this.ticketsRepository.updateStatus(ticket.uuid, TicketStatus.CLOSED);
                        await this.slackProvider.postMessageToThread(
                            ticket.slack_channel_id || "",
                            ticket.slack_thread_ts,
                            `✅ *Chamado #${ticket.protocol} finalizado com sucesso!* O status foi atualizado para Concluído na plataforma.`
                        );
                        hasChanges = true;
                        break;
                    }

                    // Mensagem normal do atendente
                    await this.ticketsRepository.addMessage({
                        ticket_uuid: ticket.uuid,
                        sender_type: MessageSenderType.SUPPORT,
                        sender_name: "Suporte SysCorrect",
                        message: text,
                    });
                    existingMessages.add(text);
                    hasChanges = true;
                }

                if (hasChanges) {
                    ticket = await this.ticketsRepository.findById(ticketUuid) as TicketWithMessages;
                }
            } catch (syncErr) {
                // Silencioso para resiliência
            }
        }

        return ticket;
    }
}

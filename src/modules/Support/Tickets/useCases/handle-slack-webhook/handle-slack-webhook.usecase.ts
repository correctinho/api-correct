import axios from "axios";
import { ITicketsRepository } from "../../repositories/ITicketsRepository";
import { IPushNotificationProvider } from "../../../../../infra/providers/PushNotificationProvider/push-notification.provider";
import { ISlackProvider } from "../../../../../infra/providers/SlackProvider/ISlackProvider";
import { MessageSenderType, TicketOrigin, TicketStatus } from "@prisma/client";

export interface SlackEventPayload {
    type?: string;
    challenge?: string;
    response_url?: string;
    actions?: Array<{
        action_id: string;
        value: string;
    }>;
    user?: {
        id?: string;
        name?: string;
        username?: string;
    };
    channel?: {
        id?: string;
    };
    container?: {
        channel_id?: string;
        message_ts?: string;
        thread_ts?: string;
    };
    event?: {
        type: string;
        user?: string;
        text?: string;
        ts?: string;
        thread_ts?: string;
        bot_id?: string;
        subtype?: string;
    };
}

export class HandleSlackWebhookUseCase {
    constructor(
        private ticketsRepository: ITicketsRepository,
        private pushNotificationProvider?: IPushNotificationProvider,
        private slackProvider?: ISlackProvider
    ) {}

    async execute(payload: SlackEventPayload): Promise<{ challenge?: string; handled: boolean }> {
        // 1. Handshake de verificação de URL do Slack
        if (payload.type === "url_verification") {
            return { challenge: payload.challenge, handled: true };
        }

        // 2. Interatividade do Slack (ex: Botão "Finalizar Chamado" clicado)
        if (payload.type === "block_actions" && payload.actions && payload.actions.length > 0) {
            const action = payload.actions[0];
            if (action.action_id === "close_ticket_action") {
                const protocol = action.value;
                const ticket = await this.ticketsRepository.findByProtocol(protocol);

                if (ticket && ticket.status !== TicketStatus.CLOSED) {
                    await this.ticketsRepository.addMessage({
                        ticket_uuid: ticket.uuid,
                        sender_type: MessageSenderType.SUPPORT,
                        sender_name: "Suporte SysCorrect",
                        message: "Atendimento concluído e finalizado pelo suporte no Slack.",
                    });

                    await this.ticketsRepository.updateStatus(ticket.uuid, TicketStatus.CLOSED);

                    const targetChannel = payload.channel?.id || ticket.slack_channel_id || "";
                    const targetThread = ticket.slack_thread_ts || "";
                    const userName = payload.user?.name || payload.user?.username || "atendente";

                    if (this.slackProvider && targetChannel && targetThread) {
                        await this.slackProvider.postMessageToThread(
                            targetChannel,
                            targetThread,
                            `✅ *Chamado #${ticket.protocol} finalizado com sucesso por @${userName}!* O status foi atualizado para Concluído na plataforma.`
                        );
                    }

                    if (payload.response_url) {
                        try {
                            await axios.post(payload.response_url, {
                                text: `✅ *Chamado #${ticket.protocol} finalizado com sucesso!*`,
                                replace_original: false,
                            });
                        } catch {}
                    }
                }
                return { handled: true };
            }
        }

        const event = payload.event;
        if (!event || event.type !== "message") {
            return { handled: false };
        }

        // 3. Ignora mensagens enviadas pelo próprio bot ou subtipos para evitar loops
        if (event.bot_id || event.subtype === "bot_message") {
            return { handled: false };
        }

        // 4. A mensagem precisa estar dentro de uma thread (thread_ts presente e diferente de ts)
        if (!event.thread_ts || event.thread_ts === event.ts) {
            return { handled: false };
        }

        const messageText = event.text?.trim();
        if (!messageText) {
            return { handled: false };
        }

        // 5. Localiza o chamado pelo timestamp da thread no Slack
        const ticket = await this.ticketsRepository.findBySlackThreadTs(event.thread_ts);
        if (!ticket) {
            console.warn(`[SlackWebhook] Nenhum chamado encontrado para a thread_ts: ${event.thread_ts}`);
            return { handled: false };
        }

        // 6. Verifica se é comando de encerramento pelo Slack (!encerrar, !concluir, etc.)
        const isClosingCommand = /^(?:!|:|\/)?(?:encerrar|concluir|fechar|finalizar)/i.test(messageText);

        if (isClosingCommand) {
            const cleanMessage = messageText.replace(/^(?:!|:|\/)?(?:encerrar|concluir|fechar|finalizar)\s*[:-]?\s*/i, '').trim();
            const messageToSave = cleanMessage || "Atendimento concluído pelo suporte.";

            await this.ticketsRepository.addMessage({
                ticket_uuid: ticket.uuid,
                sender_type: MessageSenderType.SUPPORT,
                sender_name: "Suporte SysCorrect",
                message: messageToSave,
            });

            await this.ticketsRepository.updateStatus(ticket.uuid, TicketStatus.CLOSED);

            if (this.slackProvider) {
                await this.slackProvider.postMessageToThread(
                    ticket.slack_channel_id || "",
                    ticket.slack_thread_ts || "",
                    `✅ *Chamado #${ticket.protocol} finalizado com sucesso via Slack!* O chamado foi encerrado na plataforma.`
                );
            }

            return { handled: true };
        }

        // 7. Grava a resposta normal do suporte no banco de dados
        await this.ticketsRepository.addMessage({
            ticket_uuid: ticket.uuid,
            sender_type: MessageSenderType.SUPPORT,
            sender_name: "Suporte SysCorrect",
            message: messageText,
        });

        // 8. Atualiza o status do chamado para RESPONDIDO
        await this.ticketsRepository.updateStatus(ticket.uuid, TicketStatus.ANSWERED);

        // 9. Se a origem for o Mega App, dispara Push Notification no celular do usuário
        if (ticket.origin === TicketOrigin.MEGA_APP && ticket.app_user_id && this.pushNotificationProvider) {
            try {
                await this.pushNotificationProvider.sendPushNotification({
                    userIds: [ticket.app_user_id],
                    title: "Suporte SysCorrect",
                    message: messageText.length > 100 ? `${messageText.substring(0, 97)}...` : messageText,
                    data: {
                        ticketId: ticket.uuid,
                        protocol: ticket.protocol,
                        type: "SUPPORT_REPLY",
                    },
                });
            } catch (pushErr) {
                console.error("[SlackWebhook] Erro ao disparar push notification via OneSignal:", pushErr);
            }
        }

        return { handled: true };
    }
}

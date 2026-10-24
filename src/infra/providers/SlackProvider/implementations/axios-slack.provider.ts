import axios from "axios";
import { ISlackProvider, PostTicketSlackInput, PostTicketSlackResult, SlackThreadReply } from "../ISlackProvider";

export class AxiosSlackProvider implements ISlackProvider {

    async sendMessage(channelWebhookUrl: string, message: string): Promise<void> {
        if (!channelWebhookUrl) return;
        try {
            await axios.post(channelWebhookUrl, { text: message });
        } catch (error) {
            console.error("Slack Notification Error:", error);
        }
    }

    async sendMassRegistrationAlert(companyName: string, requestUuid: string): Promise<void> {
        const webhookUrl = process.env.SLACK_WEBHOOK_REGISTRATIONS || "";
        const message = `🚨 *Nova Planilha de Cadastro em Massa!*\n*Empresa:* ${companyName}\n*ID da Solicitação:* ${requestUuid}\n👉 Acesse o painel Correct Admin para processar.`;
        await this.sendMessage(webhookUrl, message);
    }

    async sendBugAlert(errorContent: any): Promise<void> {
        const webhookUrl = process.env.SLACK_WEBHOOK_BUGS || "";
        const errorStr = JSON.stringify(errorContent, null, 2).substring(0, 500);
        const message = `🐞 *Alerta de Bug no Sistema (API 500)*\n\`\`\`\n${errorStr}\n\`\`\``;
        await this.sendMessage(webhookUrl, message);
    }

    async sendRechargeOrderAlert(companyName: string, orderUuid: string): Promise<void> {
        const webhookUrl = process.env.SLACK_WEBHOOK_ALERTA_ADMINISTRATIVOS || "";
        const message = `🚨 *Nova Recarga Aguardando Aprovação!* 🚨\n\n*Empresa:* ${companyName}\n*Pedido:* ${orderUuid}\n\n*Ação:* O comprovante de pagamento foi anexado e o pedido aguarda conferência e liberação pelo painel Admin.`;
        await this.sendMessage(webhookUrl, message);
    }

    async postTicketToSlack(input: PostTicketSlackInput): Promise<PostTicketSlackResult | null> {
        const token = process.env.SLACK_BOT_TOKEN;
        const channel = process.env.SLACK_SUPPORT_CHANNEL_ID;

        const originTag = input.origin === "EMPREGADOR" 
            ? "🏢 [EMPREGADOR]" 
            : input.origin === "PARCEIRO" 
                ? "🤝 [PARCEIRO]" 
                : "📱 [MEGA APP]";

        const originText = input.origin;

        const fields = [
            { type: "mrkdwn", text: `*Autor:*\n${input.userName}` },
            { type: "mrkdwn", text: `*Categoria:*\n${input.category}` },
            { type: "mrkdwn", text: `*Origem:*\n${originText}` },
            { type: "mrkdwn", text: `*Prioridade:*\n${input.priority || "Normal"}` },
        ];

        if (input.companyName) {
            fields.push({ type: "mrkdwn", text: `*Empresa:*\n${input.companyName}` });
        }
        if (input.userEmail) {
            fields.push({ type: "mrkdwn", text: `*E-mail:*\n${input.userEmail}` });
        }

        const blocks: any[] = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `${originTag} Chamado #${input.protocol}`,
                    emoji: true,
                },
            },
            {
                type: "section",
                fields,
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Assunto:* ${input.subject}\n\n*Mensagem:*\n>${input.message.replace(/\n/g, "\n>")}`,
                },
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "✅ Finalizar Chamado",
                            emoji: true,
                        },
                        style: "danger",
                        action_id: "close_ticket_action",
                        value: input.protocol,
                    },
                ],
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: "💬 *Responda diretamente nesta thread* para enviar uma resposta ao cliente, ou digite `!encerrar` para finalizar o chamado.",
                    },
                ],
            },
        ];

        if (!token || !channel) {
            console.warn("[SlackProvider] SLACK_BOT_TOKEN ou SLACK_SUPPORT_CHANNEL_ID não configurados no .env. Gerando identificador local de teste.");
            return {
                channel: channel || "mock-channel",
                thread_ts: `mock-${Date.now()}.${Math.floor(Math.random() * 1000)}`,
            };
        }

        try {
            const response = await axios.post(
                "https://slack.com/api/chat.postMessage",
                {
                    channel,
                    text: `${originTag} Novo chamado #${input.protocol}: ${input.subject}`,
                    blocks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && response.data.ok) {
                return {
                    channel: response.data.channel,
                    thread_ts: response.data.ts,
                };
            } else {
                console.error("[SlackProvider] Erro ao postar chamado no Slack:", response.data?.error);
                return null;
            }
        } catch (error) {
            console.error("[SlackProvider] Erro na requisição para o Slack:", error);
            return null;
        }
    }

    async postMessageToThread(channel: string, thread_ts: string, message: string): Promise<void> {
        const token = process.env.SLACK_BOT_TOKEN;
        const targetChannel = channel || process.env.SLACK_SUPPORT_CHANNEL_ID;

        if (!token || !targetChannel || !thread_ts || thread_ts.startsWith("mock-")) {
            console.warn(`[SlackProvider] Mensagem para a thread ${thread_ts} simulada localmente: "${message}"`);
            return;
        }

        try {
            await axios.post(
                "https://slack.com/api/chat.postMessage",
                {
                    channel: targetChannel,
                    thread_ts,
                    text: message,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error(`[SlackProvider] Erro ao responder na thread ${thread_ts}:`, error);
        }
    }

    async getThreadReplies(channel: string, thread_ts: string): Promise<SlackThreadReply[]> {
        const token = process.env.SLACK_BOT_TOKEN;
        const targetChannel = channel || process.env.SLACK_SUPPORT_CHANNEL_ID;

        if (!token || !targetChannel || !thread_ts || thread_ts.startsWith("mock-")) {
            return [];
        }

        try {
            const response = await axios.get(
                `https://slack.com/api/conversations.replies?channel=${targetChannel}&ts=${thread_ts}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data || !response.data.ok || !response.data.messages) {
                return [];
            }

            return response.data.messages.map((m: any) => ({
                ts: m.ts,
                text: m.text || "",
                user: m.user || "",
                isBot: !!(m.bot_id || m.subtype === "bot_message"),
            }));
        } catch (error) {
            console.error(`[SlackProvider] Erro ao buscar respostas da thread ${thread_ts}:`, error);
            return [];
        }
    }
}

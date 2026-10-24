import { ITicketsRepository, CreateTicketData, TicketWithMessages } from "../../repositories/ITicketsRepository";
import { ISlackProvider } from "../../../../../infra/providers/SlackProvider/ISlackProvider";

export interface CreateTicketDTO extends CreateTicketData {
    companyName?: string | null;
}

export class CreateTicketUseCase {
    constructor(
        private ticketsRepository: ITicketsRepository,
        private slackProvider: ISlackProvider
    ) {}

    async execute(dto: CreateTicketDTO): Promise<TicketWithMessages> {
        if (!dto.subject || !dto.subject.trim()) {
            throw new Error("O assunto do chamado é obrigatório.");
        }

        if (!dto.initialMessage || !dto.initialMessage.trim()) {
            throw new Error("A mensagem inicial do chamado é obrigatória.");
        }

        if (!dto.category) {
            throw new Error("A categoria do chamado é obrigatória.");
        }

        // 1. Cria o chamado no banco
        const ticket = await this.ticketsRepository.create(dto);

        // 2. Posta o chamado no Slack
        try {
            const slackResult = await this.slackProvider.postTicketToSlack({
                protocol: ticket.protocol,
                origin: ticket.origin,
                category: ticket.category,
                subject: ticket.subject,
                message: dto.initialMessage,
                userName: ticket.user_name,
                userEmail: ticket.user_email,
                companyName: dto.companyName,
                priority: ticket.priority,
            });

            if (slackResult) {
                await this.ticketsRepository.updateSlackThread(
                    ticket.uuid,
                    slackResult.channel,
                    slackResult.thread_ts
                );
                ticket.slack_channel_id = slackResult.channel;
                ticket.slack_thread_ts = slackResult.thread_ts;
            }
        } catch (error) {
            console.error("[CreateTicketUseCase] Falha ao postar no Slack:", error);
            // Não bloqueia a criação do chamado caso o Slack falhe
        }

        return ticket;
    }
}

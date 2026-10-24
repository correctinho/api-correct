import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { Ticket, TicketMessage, TicketStatus, MessageSenderType } from "@prisma/client";
import { ITicketsRepository, CreateTicketData, ListTicketsFilter, AddMessageData, TicketWithMessages } from "../ITicketsRepository";

export class PrismaTicketsRepository implements ITicketsRepository {
    private generateProtocol(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `SC-${year}${month}${day}-${randomNum}`;
    }

    async create(data: CreateTicketData): Promise<TicketWithMessages> {
        let protocol = this.generateProtocol();

        // Garante unicidade do protocolo
        let existing = await prismaClient.ticket.findUnique({ where: { protocol } });
        while (existing) {
            protocol = this.generateProtocol();
            existing = await prismaClient.ticket.findUnique({ where: { protocol } });
        }

        const ticket = await prismaClient.ticket.create({
            data: {
                protocol,
                origin: data.origin,
                status: TicketStatus.OPEN,
                priority: data.priority || "MEDIUM",
                category: data.category,
                subject: data.subject,
                business_id: data.business_id,
                business_user_id: data.business_user_id,
                partner_id: data.partner_id,
                app_user_id: data.app_user_id,
                user_name: data.user_name,
                user_email: data.user_email,
                user_phone: data.user_phone,
                messages: {
                    create: {
                        sender_type: MessageSenderType.CLIENT,
                        sender_name: data.user_name,
                        message: data.initialMessage,
                        attachments: data.attachments || null,
                    },
                },
            },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                },
            },
        });

        return ticket;
    }

    async findById(uuid: string): Promise<TicketWithMessages | null> {
        return prismaClient.ticket.findUnique({
            where: { uuid },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                },
            },
        });
    }

    async findByProtocol(protocol: string): Promise<TicketWithMessages | null> {
        return prismaClient.ticket.findUnique({
            where: { protocol },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                },
            },
        });
    }

    async findBySlackThreadTs(slack_thread_ts: string): Promise<TicketWithMessages | null> {
        return prismaClient.ticket.findUnique({
            where: { slack_thread_ts },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                },
            },
        });
    }

    async findMany(filters: ListTicketsFilter): Promise<Ticket[]> {
        const where: any = {};

        if (filters.origin) where.origin = filters.origin;
        if (filters.status) where.status = filters.status;
        if (filters.business_id) where.business_id = filters.business_id;
        if (filters.business_user_id) where.business_user_id = filters.business_user_id;
        if (filters.partner_id) where.partner_id = filters.partner_id;
        if (filters.app_user_id) where.app_user_id = filters.app_user_id;

        return prismaClient.ticket.findMany({
            where,
            orderBy: { updated_at: "desc" },
            include: {
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1, // Última mensagem para pré-visualização
                },
            },
        });
    }

    async addMessage(data: AddMessageData): Promise<TicketMessage> {
        const message = await prismaClient.ticketMessage.create({
            data: {
                ticket_uuid: data.ticket_uuid,
                sender_type: data.sender_type,
                sender_name: data.sender_name,
                message: data.message,
                attachments: data.attachments || null,
            },
        });

        // Atualiza a data de modificação do chamado
        await prismaClient.ticket.update({
            where: { uuid: data.ticket_uuid },
            data: { updated_at: new Date() },
        });

        return message;
    }

    async updateStatus(uuid: string, status: TicketStatus): Promise<Ticket> {
        return prismaClient.ticket.update({
            where: { uuid },
            data: { status },
        });
    }

    async updateSlackThread(uuid: string, channelId: string, threadTs: string): Promise<Ticket> {
        return prismaClient.ticket.update({
            where: { uuid },
            data: {
                slack_channel_id: channelId,
                slack_thread_ts: threadTs,
            },
        });
    }
}

import { Ticket, TicketMessage, TicketOrigin, TicketStatus, TicketPriority, MessageSenderType } from "@prisma/client";

export type TicketWithMessages = Ticket & {
    messages: TicketMessage[];
};

export interface CreateTicketData {
    origin: TicketOrigin;
    category: string;
    subject: string;
    priority?: TicketPriority;
    business_id?: string | null;
    business_user_id?: string | null;
    partner_id?: string | null;
    app_user_id?: string | null;
    user_name: string;
    user_email?: string | null;
    user_phone?: string | null;
    initialMessage: string;
    attachments?: any;
}

export interface ListTicketsFilter {
    origin?: TicketOrigin;
    status?: TicketStatus;
    business_id?: string;
    business_user_id?: string;
    partner_id?: string;
    app_user_id?: string;
}

export interface AddMessageData {
    ticket_uuid: string;
    sender_type: MessageSenderType;
    sender_name: string;
    message: string;
    attachments?: any;
}

export interface ITicketsRepository {
    create(data: CreateTicketData): Promise<TicketWithMessages>;
    findById(uuid: string): Promise<TicketWithMessages | null>;
    findByProtocol(protocol: string): Promise<TicketWithMessages | null>;
    findBySlackThreadTs(slack_thread_ts: string): Promise<TicketWithMessages | null>;
    findMany(filters: ListTicketsFilter): Promise<Ticket[]>;
    addMessage(data: AddMessageData): Promise<TicketMessage>;
    updateStatus(uuid: string, status: TicketStatus): Promise<Ticket>;
    updateSlackThread(uuid: string, channelId: string, threadTs: string): Promise<Ticket>;
}

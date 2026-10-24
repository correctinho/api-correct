export interface PostTicketSlackInput {
    protocol: string;
    origin: "EMPREGADOR" | "PARCEIRO" | "MEGA_APP";
    category: string;
    subject: string;
    message: string;
    userName: string;
    userEmail?: string | null;
    companyName?: string | null;
    priority?: string;
}

export interface PostTicketSlackResult {
    channel: string;
    thread_ts: string;
}

export interface SlackThreadReply {
    ts: string;
    text: string;
    user: string;
    isBot: boolean;
}

export interface ISlackProvider {
    sendMessage(channelWebhookUrl: string, message: string): Promise<void>;
    sendMassRegistrationAlert(companyName: string, requestUuid: string): Promise<void>;
    sendBugAlert(errorContent: any): Promise<void>;
    sendRechargeOrderAlert(companyName: string, orderUuid: string): Promise<void>;
    postTicketToSlack(input: PostTicketSlackInput): Promise<PostTicketSlackResult | null>;
    postMessageToThread(channel: string, thread_ts: string, message: string): Promise<void>;
    getThreadReplies(channel: string, thread_ts: string): Promise<SlackThreadReply[]>;
}

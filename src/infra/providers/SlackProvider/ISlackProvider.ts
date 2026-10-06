export interface ISlackProvider {
    sendMessage(channelWebhookUrl: string, message: string): Promise<void>;
    sendMassRegistrationAlert(companyName: string, requestUuid: string): Promise<void>;
    sendBugAlert(errorContent: any): Promise<void>;
    sendRechargeOrderAlert(companyName: string, orderUuid: string): Promise<void>;
}

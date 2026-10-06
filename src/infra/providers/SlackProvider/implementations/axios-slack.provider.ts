import axios from "axios";
import { ISlackProvider } from "../ISlackProvider";

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
        const webhookUrl = process.env.SLACK_WEBHOOK_ALERTA_ADMINISTRATIVOS
        const message = `🚨 *Nova Recarga Aguardando Aprovação!* 🚨\n\n*Empresa:* ${companyName}\n*Pedido:* ${orderUuid}\n\n*Ação:* O comprovante de pagamento foi anexado e o pedido aguarda conferência e liberação pelo painel Admin.`;
        await this.sendMessage(webhookUrl, message);
    }

}
''
import { Request, Response } from "express";
import { SendTicketMessageUseCase } from "./send-ticket-message.usecase";

export class SendTicketMessageController {
    constructor(private sendTicketMessageUseCase: SendTicketMessageUseCase) {}

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { message, attachments } = req.body;

            let senderName = "Usuário";
            const callerBusinessId = req.companyUser?.businessInfoUuid;
            const callerAppUserId = req.appUser?.appUserId;
            const isAdmin = !!req.correctAdmin;

            if (req.companyUser) {
                senderName = req.companyUser.name || "Usuário Empresa";
            } else if (req.appUser) {
                senderName = req.body.user_name || req.appUser.email?.split("@")[0] || "Usuário Mega App";
            } else if (req.correctAdmin) {
                senderName = req.correctAdmin.userName || "Suporte SysCorrect";
            } else {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const ticketMessage = await this.sendTicketMessageUseCase.execute({
                ticketUuid: id,
                senderName,
                message,
                attachments,
                callerBusinessId,
                callerAppUserId,
                isAdmin,
            });

            return res.status(201).json(ticketMessage);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao enviar mensagem." });
        }
    }
}

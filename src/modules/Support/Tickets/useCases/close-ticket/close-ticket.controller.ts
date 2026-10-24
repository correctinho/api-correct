import { Request, Response } from "express";
import { CloseTicketUseCase } from "./close-ticket.usecase";

export class CloseTicketController {
    constructor(private closeTicketUseCase: CloseTicketUseCase) {}

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            let closedByName = "Usuário";
            const callerBusinessId = req.companyUser?.businessInfoUuid;
            const callerAppUserId = req.appUser?.appUserId;
            const isAdmin = !!req.correctAdmin;

            if (req.companyUser) {
                closedByName = req.companyUser.name || "Usuário Empresa";
            } else if (req.appUser) {
                closedByName = req.body.user_name || req.appUser.email?.split("@")[0] || "Usuário Mega App";
            } else if (req.correctAdmin) {
                closedByName = req.correctAdmin.userName || "Suporte SysCorrect";
            } else {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const ticket = await this.closeTicketUseCase.execute(id, closedByName, callerBusinessId, callerAppUserId, isAdmin);
            return res.status(200).json(ticket);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao encerrar chamado." });
        }
    }
}

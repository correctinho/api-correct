import { Request, Response } from "express";
import { CreateTicketUseCase } from "./create-ticket.usecase";
import { TicketOrigin } from "@prisma/client";

export class CreateTicketController {
    constructor(private createTicketUseCase: CreateTicketUseCase) {}

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const { category, subject, message, priority, attachments } = req.body;

            let origin: TicketOrigin = TicketOrigin.EMPREGADOR;
            let business_id: string | null = null;
            let business_user_id: string | null = null;
            let partner_id: string | null = null;
            let app_user_id: string | null = null;
            let user_name = "Usuário";
            let user_email: string | null = null;
            let companyName: string | null = null;

            if (req.companyUser) {
                // Usuário do Empregador ou Parceiro
                business_id = req.companyUser.businessInfoUuid;
                business_user_id = req.companyUser.companyUserId;
                user_name = req.companyUser.name || "Usuário Empresa";
                user_email = req.companyUser.email;
                companyName = req.companyUser.fantasy_name || req.companyUser.corporate_reason || "Empresa";

                // Se houver indicador de parceiro
                if (req.body.origin === "PARCEIRO" || req.headers["x-portal-origin"] === "parceiro") {
                    origin = TicketOrigin.PARCEIRO;
                    partner_id = business_id;
                } else {
                    origin = TicketOrigin.EMPREGADOR;
                }
            } else if (req.appUser) {
                // Usuário do Mega App
                origin = TicketOrigin.MEGA_APP;
                app_user_id = req.appUser.appUserId;
                user_email = req.appUser.email;
                user_name = req.body.user_name || req.appUser.email?.split("@")[0] || "Usuário Mega App";
            } else if (req.correctAdmin) {
                // Admin Correct abrindo chamado interno
                origin = TicketOrigin.EMPREGADOR;
                user_name = req.correctAdmin.userName || "Admin";
                user_email = req.correctAdmin.email;
            } else {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const ticket = await this.createTicketUseCase.execute({
                origin,
                category,
                subject,
                priority,
                business_id,
                business_user_id,
                partner_id,
                app_user_id,
                user_name,
                user_email,
                companyName,
                initialMessage: message,
                attachments,
            });

            return res.status(201).json(ticket);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao criar chamado." });
        }
    }
}

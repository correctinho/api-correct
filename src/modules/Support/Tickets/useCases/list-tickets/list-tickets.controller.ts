import { Request, Response } from "express";
import { ListTicketsUseCase } from "./list-tickets.usecase";
import { ListTicketsFilter } from "../../repositories/ITicketsRepository";
import { TicketStatus, TicketOrigin } from "@prisma/client";

export class ListTicketsController {
    constructor(private listTicketsUseCase: ListTicketsUseCase) {}

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const filters: ListTicketsFilter = {};

            if (req.query.status) {
                filters.status = req.query.status as TicketStatus;
            }
            if (req.query.origin) {
                filters.origin = req.query.origin as TicketOrigin;
            }

            if (req.companyUser) {
                filters.business_id = req.companyUser.businessInfoUuid;
            } else if (req.appUser) {
                filters.app_user_id = req.appUser.appUserId;
            } else if (req.correctAdmin) {
                // Admin vê tudo, ou pode filtrar por query params
                if (req.query.business_id) filters.business_id = req.query.business_id as string;
                if (req.query.app_user_id) filters.app_user_id = req.query.app_user_id as string;
            } else {
                return res.status(401).json({ error: "Usuário não autenticado." });
            }

            const tickets = await this.listTicketsUseCase.execute(filters);
            return res.status(200).json(tickets);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || "Erro ao listar chamados." });
        }
    }
}

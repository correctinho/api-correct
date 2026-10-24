import { Request, Response } from "express";
import { GetTicketDetailsUseCase } from "./get-ticket-details.usecase";

export class GetTicketDetailsController {
    constructor(private getTicketDetailsUseCase: GetTicketDetailsUseCase) {}

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const callerBusinessId = req.companyUser?.businessInfoUuid;
            const callerAppUserId = req.appUser?.appUserId;
            const isAdmin = !!req.correctAdmin;

            const ticket = await this.getTicketDetailsUseCase.execute(id, callerBusinessId, callerAppUserId, isAdmin);
            return res.status(200).json(ticket);
        } catch (error: any) {
            return res.status(404).json({ error: error.message || "Chamado não encontrado." });
        }
    }
}

import { Request, Response } from "express";
import { GetAppUserOverviewByAdminUsecase } from "./get-app-user-overview-by-admin.usecase";

export class GetAppUserOverviewByAdminController {
    constructor(private readonly usecase: GetAppUserOverviewByAdminUsecase) {}

    async handle(request: Request, response: Response): Promise<Response> {
        const { document } = request.params;

        if (!document) {
            return response.status(400).json({ message: "CPF é obrigatório." });
        }

        const overview = await this.usecase.execute(document);

        return response.status(200).json(overview);
    }
}

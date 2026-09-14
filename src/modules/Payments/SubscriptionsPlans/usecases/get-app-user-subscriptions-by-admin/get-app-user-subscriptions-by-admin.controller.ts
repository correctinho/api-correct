import { Request, Response } from "express";
import { GetAppUserSubscriptionsByAdminUsecase } from "./get-app-user-subscriptions-by-admin.usecase";

export class GetAppUserSubscriptionsByAdminController {
    constructor(private readonly usecase: GetAppUserSubscriptionsByAdminUsecase) {}

    async handle(request: Request, response: Response): Promise<Response> {
        const { user_info_uuid } = request.params;

        if (!user_info_uuid) {
            return response.status(400).json({ message: "O parâmetro user_info_uuid é obrigatório." });
        }

        const subscriptions = await this.usecase.execute(user_info_uuid);

        return response.status(200).json(subscriptions);
    }
}

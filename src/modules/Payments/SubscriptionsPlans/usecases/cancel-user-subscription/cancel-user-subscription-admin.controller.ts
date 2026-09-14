import { Request, Response } from "express";
import { CancelUserSubscriptionUsecase } from "./cancel-user-subscription.usecase";

export class CancelUserSubscriptionAdminController {
    constructor(private readonly usecase: CancelUserSubscriptionUsecase) { }

    async handle(request: Request, response: Response): Promise<Response> {
        // Obter ID do admin logado (geralmente extraído do token pelo middleware correctIsAuth)
        const adminId = request.correctAdmin.correctAdminId

        // Pega os dados do corpo da requisição
        const { subscriptionUuid, reason } = request.body;

        if (!subscriptionUuid) {
            return response.status(400).json({ message: "O parâmetro subscriptionUuid é obrigatório." });
        }

        await this.usecase.execute({
            subscriptionUuid,
            userId: adminId, // Passamos o adminId apenas para constar, pois com isAdmin = true a checagem de posse é ignorada
            reason: reason || "Cancelamento administrativo",
            isAdmin: true
        });

        return response.status(200).json({ message: "Assinatura cancelada administrativamente com sucesso." });
    }
}

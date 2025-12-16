import { Request, Response } from "express";
import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { ListSubscriptionsUseCase } from "./list-subscriptions.usecase";

class ListSubscriptionsController {
    async handle(request: Request, response: Response): Promise<Response> {
        const subscriptionRepository = new SubscriptionPrismaRepository();
        const listSubscriptionsUseCase = new ListSubscriptionsUseCase(subscriptionRepository);

        const subscriptions = await listSubscriptionsUseCase.execute();

        const subscriptionsJSON = subscriptions.map((subscription) => subscription.toJSON());

        return response.status(200).json(subscriptionsJSON);
    }
}

export { ListSubscriptionsController };

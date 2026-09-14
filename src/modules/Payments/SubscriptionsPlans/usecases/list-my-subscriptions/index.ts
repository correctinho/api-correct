import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { ListMySubscriptionsController } from "./list-my-subscriptions.controller";
import { ListMySubscriptionsUseCase } from "./list-my-subscriptions.usecase";

const listMySubscriptionsFactory = () => {
    const repository = new SubscriptionPrismaRepository();
    const usecase = new ListMySubscriptionsUseCase(repository);
    const controller = new ListMySubscriptionsController(usecase);
    return controller;
}

export const listMySubscriptionsController = listMySubscriptionsFactory();

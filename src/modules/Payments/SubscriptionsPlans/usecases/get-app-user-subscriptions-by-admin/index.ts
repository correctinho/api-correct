import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { GetAppUserSubscriptionsByAdminController } from "./get-app-user-subscriptions-by-admin.controller";
import { GetAppUserSubscriptionsByAdminUsecase } from "./get-app-user-subscriptions-by-admin.usecase";

const subscriptionRepository = new SubscriptionPrismaRepository();

const getAppUserSubscriptionsByAdminUsecase = new GetAppUserSubscriptionsByAdminUsecase(subscriptionRepository);
const getAppUserSubscriptionsByAdminController = new GetAppUserSubscriptionsByAdminController(getAppUserSubscriptionsByAdminUsecase);

export { getAppUserSubscriptionsByAdminController };

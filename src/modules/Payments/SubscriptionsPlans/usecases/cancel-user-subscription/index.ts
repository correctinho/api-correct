import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { CancelUserSubscriptionController } from "./cancel-user-subscription.controller";
import { CancelUserSubscriptionAdminController } from "./cancel-user-subscription-admin.controller";
import { CancelUserSubscriptionUsecase } from "./cancel-user-subscription.usecase";

const subscriptionRepository = new SubscriptionPrismaRepository();
const cancelUserSubscriptionUsecase = new CancelUserSubscriptionUsecase(subscriptionRepository);
const cancelUserSubscriptionController = new CancelUserSubscriptionController(cancelUserSubscriptionUsecase);
const cancelUserSubscriptionAdminController = new CancelUserSubscriptionAdminController(cancelUserSubscriptionUsecase);

export { cancelUserSubscriptionController, cancelUserSubscriptionAdminController };

import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { ListSubscriptionPlansByAppUserController } from "./list-subscription-plans-by-appuser.controller";
import { ListSubscriptionPlansAppUserUseCase } from "./list-subscription-plans-by-appuser.usecase";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository();
const subscriptionRepository = new SubscriptionPrismaRepository();
const listSubscriptionPlansUseCase = new ListSubscriptionPlansAppUserUseCase(subscriptionPlanRepository, subscriptionRepository);
const listSubscriptionPlansController = new ListSubscriptionPlansByAppUserController(listSubscriptionPlansUseCase);

export { listSubscriptionPlansController };

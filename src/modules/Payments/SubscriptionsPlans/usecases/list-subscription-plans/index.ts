import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { ListSubscriptionPlansController } from "./list-subscription-plans.controller";
import { ListSubscriptionPlansUseCase } from "./list-subscription-plans.usecase";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository();
const listSubscriptionPlansUseCase = new ListSubscriptionPlansUseCase(subscriptionPlanRepository);
const listSubscriptionPlansController = new ListSubscriptionPlansController(listSubscriptionPlansUseCase);

export { listSubscriptionPlansController };

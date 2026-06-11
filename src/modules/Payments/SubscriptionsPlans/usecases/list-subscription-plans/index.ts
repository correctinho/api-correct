import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { ListSubscriptionPlansUseCase } from "./list-subscription-plans.usecase";
import { ListSubscriptionPlansController } from "./list-subscription-plans.controller";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository();
const listSubscriptionPlansUseCase = new ListSubscriptionPlansUseCase(subscriptionPlanRepository);
const listSubscriptionPlansAdminController = new ListSubscriptionPlansController(listSubscriptionPlansUseCase);

export { listSubscriptionPlansAdminController };

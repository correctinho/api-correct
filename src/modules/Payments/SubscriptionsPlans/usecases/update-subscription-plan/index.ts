import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { UpdateSubscriptionPlanUseCase } from "./update-subscription-plan.usecase";
import { UpdateSubscriptionPlanController } from "./update-subscription-plan.controller";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository();
const updateSubscriptionPlanUseCase = new UpdateSubscriptionPlanUseCase(subscriptionPlanRepository);
const updateSubscriptionPlanController = new UpdateSubscriptionPlanController(updateSubscriptionPlanUseCase);

export { updateSubscriptionPlanController };

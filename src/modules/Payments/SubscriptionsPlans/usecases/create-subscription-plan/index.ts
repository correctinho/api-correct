import { BenefitPrismaRepository } from "../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { BenefitGroupsEntity } from "../../../../Company/BenefitGroups/entities/benefit-groups.entity";
import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { CreateSubscriptionPlanController } from "./create-subscription-plan.controller";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository()
const itemRepository = new BenefitPrismaRepository()

const createSubscriptionController = new CreateSubscriptionPlanController(
    subscriptionPlanRepository,
    itemRepository,
)

export { createSubscriptionController }

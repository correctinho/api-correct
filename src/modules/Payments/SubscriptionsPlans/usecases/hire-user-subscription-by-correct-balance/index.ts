import { PasswordBCrypt } from "../../../../../infra/shared/crypto/password.bcrypt";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { BenefitPrismaRepository } from "../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { TermsOfServicePrismaRepository } from "../../../../Terms/repositories/implementations/prisma-terms-of-service.repository";
import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { HireUserSubscriptionByCorrectBalanceController } from "./hire-user-subscription-by-correct-balance.controller";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository();
const userItemRepository = new AppUserItemPrismaRepository()
const benefitsRepository = new BenefitPrismaRepository()
const termsRepository = new TermsOfServicePrismaRepository()
const subscriptionRepository = new SubscriptionPrismaRepository();
const hashService = new PasswordBCrypt()

const hireUserSubscriptionByCorrectBalanceController = new HireUserSubscriptionByCorrectBalanceController(
    subscriptionPlanRepository,
    userItemRepository,
    benefitsRepository,
    termsRepository,
    subscriptionRepository,
    hashService
);

export { hireUserSubscriptionByCorrectBalanceController}
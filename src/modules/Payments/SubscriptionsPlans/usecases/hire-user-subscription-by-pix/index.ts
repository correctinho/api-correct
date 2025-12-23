import { SicrediPixProvider } from "../../../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider";
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { BenefitPrismaRepository } from "../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { TermAcceptancePrismaRepository } from "../../../../Terms/repositories/implementations/prisma-term-acceptance.repository";
import { TermsOfServicePrismaRepository } from "../../../../Terms/repositories/implementations/prisma-terms-of-service.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { CreateUserSubscriptionController } from "./hire-user-subscription-by-pix.controller";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository()
const subscriptionRepository = new SubscriptionPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const pixProver = new SicrediPixProvider()
const userItemRepository = new AppUserItemPrismaRepository()
const benefitsRepository = new BenefitPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository()
const termsRepository = new TermsOfServicePrismaRepository()
const termAcceptanceRepository = new TermAcceptancePrismaRepository()
const createUserSubscriptionController = new CreateUserSubscriptionController(
    subscriptionPlanRepository,
    subscriptionRepository,
    userInfoRepository,
    pixProver,
    userItemRepository,
    benefitsRepository,
    transactionRepository,
    termsRepository,
    termAcceptanceRepository
)

export { createUserSubscriptionController}
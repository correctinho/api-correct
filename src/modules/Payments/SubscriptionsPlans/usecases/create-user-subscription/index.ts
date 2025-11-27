import { SicrediPixProvider } from "../../../../../infra/providers/PixProvider/implementations/sicredi/sicredi-pix.provider";
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { AppUserItemPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { BenefitPrismaRepository } from "../../../../benefits/repositories/implementations/benefit.prisma.repository";
import { TransactionOrderPrismaRepository } from "../../../Transactions/repositories/implementations/transaction-order-prisma.repository";
import { SubscriptionPlanPrismaRepository } from "../../repositories/implementations/subscription-plan.prisma.repository";
import { SubscriptionPrismaRepository } from "../../repositories/implementations/subscription.prisma.repository";
import { CreateUserSubscriptionController } from "./create-user-subscription.controller";

const subscriptionPlanRepository = new SubscriptionPlanPrismaRepository()
const subscriptionRepository = new SubscriptionPrismaRepository()
const userInfoRepository = new AppUserInfoPrismaRepository()
const pixProver = new SicrediPixProvider()
const userItemRepository = new AppUserItemPrismaRepository()
const benefitsRepository = new BenefitPrismaRepository()
const transactionRepository = new TransactionOrderPrismaRepository()

const createUserSubscriptionController = new CreateUserSubscriptionController(
    subscriptionPlanRepository,
    subscriptionRepository,
    userInfoRepository,
    pixProver,
    userItemRepository,
    benefitsRepository,
    transactionRepository
)

export { createUserSubscriptionController}
import { AppUserItemPrismaRepository } from "../../AppUser/AppUserManagement/repositories/implementations-user-item/app-user-item-prisma.repository";
import { SubscriptionPrismaRepository } from "../../Payments/SubscriptionsPlans/repositories/implementations/subscription.prisma.repository";
import { ExpireSubscriptionsJob } from "./ExpireSubscriptionsJob";

const subscriptionsRepository = new SubscriptionPrismaRepository()
const userItemRepository = new AppUserItemPrismaRepository()

const expireSubscriptionsJob = new ExpireSubscriptionsJob(
  subscriptionsRepository,
  userItemRepository
);

export { expireSubscriptionsJob };
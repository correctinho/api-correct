import { listSubscriptionPlansController } from "../../modules/Payments/SubscriptionsPlans/usecases/list-subscription-plans";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { Router } from "express";
import { createSubscriptionController } from "../../modules/Payments/SubscriptionsPlans/usecases/create-subscription-plan";
import { createUserSubscriptionController } from "../../modules/Payments/SubscriptionsPlans/usecases/create-user-subscription";

const subscriptionRouter = Router()

//create subscription plan
subscriptionRouter.post("/subscription-plan", async (request, response) => {
    await createSubscriptionController.handle(request, response)
})

//create user subscription
subscriptionRouter.post("/user-subscription", appUserIsAuth, async (request, response) => {
    await createUserSubscriptionController.handle(request, response)
})

//list all subscription plans
subscriptionRouter.get("/app-user/subscription-plans", async (request, response) => {
    await listSubscriptionPlansController.handle(request, response)
})

export { subscriptionRouter };
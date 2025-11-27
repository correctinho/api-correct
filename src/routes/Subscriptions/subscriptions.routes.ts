import { Router } from "express";
import { createSubscriptionController } from "../../modules/Payments/SubscriptionsPlans/usecases/create-subscription-plan";
import { createUserSubscriptionController } from "../../modules/Payments/SubscriptionsPlans/usecases/create-user-subscription";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";

const subscriptionRouter = Router()

//create subscription plan
subscriptionRouter.post("/subscription-plan", async (request, response) => {
    await createSubscriptionController.handle(request, response)
})

//create user subscription
subscriptionRouter.post("/user-subscription", appUserIsAuth, async (request, response) => {
    await createUserSubscriptionController.handle(request, response)
})

export { subscriptionRouter };
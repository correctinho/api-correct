import { listSubscriptionPlansController } from "../../modules/Payments/SubscriptionsPlans/usecases/list-subscription-plans-by-app-user";
import { appUserIsAuth } from "../../infra/shared/middlewares/AppUser/app-user-auth.middleware";
import { Router } from "express";
import { createSubscriptionController } from "../../modules/Payments/SubscriptionsPlans/usecases/create-subscription-plan";
import { createUserSubscriptionController } from "../../modules/Payments/SubscriptionsPlans/usecases/hire-user-subscription-by-pix";
import { hireUserSubscriptionByCorrectBalanceController } from "../../modules/Payments/SubscriptionsPlans/usecases/hire-user-subscription-by-correct-balance";

const subscriptionRouter = Router()

//create subscription plan
subscriptionRouter.post("/subscription-plan", async (request, response) => {
    await createSubscriptionController.handle(request, response)
})

//hire user subscription with PIX
subscriptionRouter.post("/user-subscription/pix", appUserIsAuth, async (request, response) => {
    await createUserSubscriptionController.handle(request, response)
})

//hire user subscription with CORRECT balance
subscriptionRouter.post("/user-subscription/correct-balance", appUserIsAuth, async (request, response) => {
    await hireUserSubscriptionByCorrectBalanceController.handle(request, response)
})

//list all subscription plans by app user
subscriptionRouter.get("/app-user/subscription-plans", appUserIsAuth, async (request, response) => {
    await listSubscriptionPlansController.handle(request, response)
})

export { subscriptionRouter };
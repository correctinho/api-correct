import { SubscriptionPlanToJSONOutput } from "../../../entities/subscription-plan.entity";

export type OutputListSubscriptionPlansDto = (SubscriptionPlanToJSONOutput & {
    is_hired: boolean;
})[];

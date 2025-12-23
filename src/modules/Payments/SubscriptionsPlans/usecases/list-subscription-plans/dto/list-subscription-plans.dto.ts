import { SubscriptionPlanToJSONOutput } from "../../../entities/subscription-plan.entity";

export type SubscriptionPlanWithStatus = SubscriptionPlanToJSONOutput & {
    is_hired: boolean;
};

export type OutputListSubscriptionPlansDto = SubscriptionPlanWithStatus[];

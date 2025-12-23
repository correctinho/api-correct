import { SubscriptionStatus } from "@prisma/client";

export interface InputHireUserSubscriptionByPixDto {
    user_info_uuid: string;
    subscription_plan_uuid: string;
    accepted_terms_version_uuid: string;
    ip_address: string | null;
    user_agent: string | null;
}

export interface OutputHireUserSubscriptionByPixDto {
    subscription_uuid: string;
    user_item_uuid: string;
    status: SubscriptionStatus;
    pix_qr_code: string;
    pix_expiration: Date;
    amount_in_cents: number;
}
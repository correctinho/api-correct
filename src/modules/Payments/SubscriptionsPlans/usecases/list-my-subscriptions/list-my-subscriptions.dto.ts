export interface OutputListMySubscriptionsDTO {
    subscriptions: {
        uuid: string;
        status: string;
        start_date: Date;
        end_date: Date | null;
        next_billing_date: Date | null;
        plan: {
            uuid: string;
            name: string;
            price: number;
            billing_period: string;
        };
        program: {
            uuid: string;
            name: string;
            img_url: string | null;
        } | null;
    }[];
}

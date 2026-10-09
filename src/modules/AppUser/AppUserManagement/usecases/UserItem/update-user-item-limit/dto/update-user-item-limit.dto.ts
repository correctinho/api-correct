
export type InputUpdateUserItemLimitDTO = {
    user_item_uuid: string;
    business_info_uuid: string;
    new_limit: number; // In cents (e.g. 10000 for R$ 100)
};

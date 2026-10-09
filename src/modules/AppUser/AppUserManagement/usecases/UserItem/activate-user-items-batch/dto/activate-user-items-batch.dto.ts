export type InputActivateBatchDTO = {
    business_info_uuid: string;
    item_uuid: string;
    users: {
        user_info_uuid: string;
        custom_value?: number;
    }[];
};
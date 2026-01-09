export type InputApproveRechargeOrderDTO = {
    order_uuid: string;
    admin_uuid: string;
}

export type OutputApproveRechargeOrderDTO = {
    status: string;
    processed_items_count: number;
}
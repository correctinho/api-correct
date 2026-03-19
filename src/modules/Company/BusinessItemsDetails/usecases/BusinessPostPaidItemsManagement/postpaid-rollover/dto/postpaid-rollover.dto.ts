export interface InputPostpaidRolloverDTO {
    employer_item_details_uuid: string;
}

export interface OutputPostpaidRolloverDTO {
    success: boolean;
    message: string;
    total_users_updated: number;
}

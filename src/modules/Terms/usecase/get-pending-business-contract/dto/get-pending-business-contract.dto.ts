export interface InputGetPendingBusinessContractDTO {
    business_info_uuid: string;
}

export interface OutputGetPendingBusinessContractDTO {
    uuid: string;
    rendered_html: string;
    status: string;
}
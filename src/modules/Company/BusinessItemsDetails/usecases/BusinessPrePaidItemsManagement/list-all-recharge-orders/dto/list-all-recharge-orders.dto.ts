export interface InputListAllRechargeOrdersDTO {
    page?: number;
    limit?: number;
    status?: string;
}

export interface OutputListAllRechargeOrdersDTO {
    data: {
        uuid: string;
        business_info_uuid: string;
        business_fantasy_name: string;
        total_amount: number;
        status: string;
        employees_count: number;
        created_at: Date;
        payment_proof_url?: string | null;
    }[];
    count: number;
    page: number;
    limit: number;
}
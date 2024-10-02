import { Status } from "@prisma/client";
import { Uuid } from "../../../../../../../@shared/ValueObjects/uuid.vo";

export interface InputCreateUserInfoDTO {
    business_info_uuid: string;
    document: string | null;
    document2: string | null;
    document3: string | null;
    full_name: string;
    display_name: string | null;
    internal_company_code: string | null;
    gender: string | null;
    date_of_birth: string;
    salary: number | null;
    phone: string | null;
    email: string | null
    company_owner: boolean;
    status: Status | null;
    function: string | null;
    recommendation_code: string | null;
    is_authenticated: boolean;
    marital_status: string | null;
    dependents_quantity: number;
    user_document_validation_uuid: Uuid | null;
    created_at?: string
    updated_at?: string
    user_id: Uuid | null
}

export interface OutputCreateUserInfoDTO {

}

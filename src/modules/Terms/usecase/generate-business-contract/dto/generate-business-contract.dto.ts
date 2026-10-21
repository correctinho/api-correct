export interface InputGenerateBusinessContractDTO {
    business_info_uuid: string;
}

export interface OutputGenerateBusinessContractDTO {
    uuid: string;
    status: string;
}

export interface BusinessContractDataProps {
    uuid: string;
    contract_number: string | null;
    corporate_reason: string;
    fantasy_name: string | null;
    document: string;
    legal_representative_name: string | null;
    legal_representative_cpf: string | null;
    address: {
        line1: string;
        line2: string;
        line3: string | null;
        neighborhood: string;
        city: string;
        state: string;
        postal_code: string;
    } | null;
    use_marketing: boolean;
    use_market_place: boolean;
    use_correct_fidelity: boolean;
    admin_tax: number;
    marketing_tax: number;
    market_place_tax: number;
    programs: {
        uuid: string;
        name: string;
        checked: string;
    }[];
}

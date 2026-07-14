// src/modules/Terms/usecase/generate-business-contract/dto/generate-business-contract.dto.ts

export interface InputGenerateBusinessContractDTO {
    business_info_uuid: string;
}

export interface OutputGenerateBusinessContractDTO {
    uuid: string;
    status: string;
}

// Dados que o repositório precisa devolver para o UseCase conseguir montar o HTML
export interface BusinessContractDataProps {
    uuid: string;
    corporate_reason: string;
    fantasy_name: string;
    document: string;
    admin_tax: number;
    marketing_tax: number;
    market_place_tax: number;
}
import { BusinessContractDataProps } from "../usecase/generate-business-contract/dto/generate-business-contract.dto";

export interface IBusinessContractRepository {
    // Busca as informações do lojista e das taxas (BusinessInfo + PartnerConfig)
    getBusinessData(business_info_uuid: string): Promise<BusinessContractDataProps | null>;

    // Busca a versão ativa do template B2B_BUSINESS_MSA na tabela TermsOfService
    getActiveB2BTerm(): Promise<{ uuid: string; content: string } | null>;

    // Salva o rascunho na tabela BusinessContract
    savePendingContract(data: {
        business_info_uuid: string;
        terms_uuid: string;
        rendered_html: string;
        status: 'PENDING';
    }): Promise<{ uuid: string; status: string }>;

    findPendingByBusiness(business_info_uuid: string): Promise<{
        uuid: string;
        rendered_html: string;
        status: string;
    } | null>;
}
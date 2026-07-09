export interface InputGenerateOnboardingPixDTO {
    business_info_uuid: string;
}

export interface OutputGenerateOnboardingPixDTO {
    txid: string;
    pixCopiaECola: string;
    expirationDate: Date;
}

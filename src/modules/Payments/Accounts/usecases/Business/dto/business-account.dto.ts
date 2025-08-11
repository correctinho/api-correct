import { PartnerCreditStatus } from "@prisma/client";

export type InputGetBusinessAccountDTO = {
  business_info_uuid: string;
}

export type OutputGetBusinessAccountDTO = {
  uuid: string;
  business_info_uuid: string;
  balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}


export type InputFindPartnerCreditsDTO = {
  businessInfoId: string;
  // Opcional: Futuramente, pode receber filtros como status, data, etc.
  // status?: PartnerCreditStatus; 
};

export type PartnerCreditOutput = {
  uuid: string;
  balance: number; // Em centavos, para ser tratado no frontend
  status: PartnerCreditStatus;
  availability_date: Date; // A data de liquidação
  original_transaction_uuid: string;
  created_at: Date;
};

// O Output final
export type OutputFindPartnerCreditsDTO = PartnerCreditOutput[];


export type InputProcessPaymentByPartnerDTO = {
  transactionId: string;
  
  /** O ID da empresa (BusinessInfo) do parceiro que está pagando. Virá do token de autenticação. */
  payerBusinessInfoId: string;
};

export type OutputProcessPaymentByPartnerDTO = {
  success: boolean;
  transactionId: string;
  netAmountPaid: number; // Em Reais
  amountPaidFromCredits: number; // Em Reais
  amountPaidFromLiquidBalance: number; // Em Reais
  payerFinalLiquidBalance: number; // Em Reais
};
import { BillingPeriod, PayerType } from "@prisma/client";
import { SubscriptionPlanToJSONOutput } from "../../../entities/subscription-plan.entity";

// DTO de Entrada: Dados primitivos que vêm do controller
export interface InputCreateSubscriptionPlanDto {
  item_uuid: string;
  name: string;
  description?: string | null;
  price: number; // Valor em REAIS (ex: 49.90)
  billing_period: BillingPeriod;
  payer_type: PayerType;
  // is_active e currency são opcionais, a entidade usa defaults se não informados
  is_active?: boolean;
  currency?: string;
}

// DTO de Saída: Usa o tipo de retorno padrão da entidade
export type OutputCreateSubscriptionPlanDto = SubscriptionPlanToJSONOutput;

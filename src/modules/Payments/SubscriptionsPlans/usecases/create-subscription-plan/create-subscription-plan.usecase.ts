import { BillingPeriod, PayerType } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ISubscriptionPlanRepository } from "../../repositories/subscription-plan.repository";
import { SubscriptionPlanEntity, SubscriptionPlanToJSONOutput } from "../../entities/subscription-plan.entity";
import { InputCreateSubscriptionPlanDto, OutputCreateSubscriptionPlanDto } from "./dto/create-subscription-plan.dto";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { CustomError } from "../../../../../errors/custom.error";


export class CreateSubscriptionPlanUsecase {
  constructor(
    // Injeção de dependência do repositório
    private readonly subscriptionPlanRepository: ISubscriptionPlanRepository,
    private readonly itemRepository: IBenefitsRepository,
  ) {}

  async execute(input: InputCreateSubscriptionPlanDto): Promise<OutputCreateSubscriptionPlanDto> {
    // 1. Criação da Entidade
    // Usamos o método fábrica 'create' para novos planos.
    // Ele se encarrega de gerar o UUID, datas e CONVERTER O PREÇO (Reais -> Centavos).
    const planEntity = SubscriptionPlanEntity.create({
      item_uuid: new Uuid(input.item_uuid), // Converte string para VO
      name: input.name,
      description: input.description,
      price: input.price, // Passa o valor em REAIS
      billing_period: input.billing_period,
      payer_type: input.payer_type,
      is_active: input.is_active,
      currency: input.currency,
    });

    //verifica se o item existe
    const item = await this.itemRepository.find(planEntity.item_uuid)
    if(!item) throw new CustomError("Item not found", 404);
    if(item.item_type === 'gratuito') throw new CustomError("Cannot create subscription plan for free item", 400);
    
    // 2. Persistência
    // O repositório salvará a entidade (que já contém o preço em centavos internamente)
    await this.subscriptionPlanRepository.create(planEntity);

    // 3. Retorno
    // Retorna o JSON da entidade, que converterá o preço de volta para Reais na saída.
    return planEntity.toJSON();
  }
}
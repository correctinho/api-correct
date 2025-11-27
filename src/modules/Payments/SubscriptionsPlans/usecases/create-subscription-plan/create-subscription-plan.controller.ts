import { Request, Response } from 'express';
import { BillingPeriod, PayerType } from '@prisma/client';
import { CreateSubscriptionPlanUsecase } from './create-subscription-plan.usecase';
import { CustomError } from '../../../../../errors/custom.error';
import { InputCreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { ISubscriptionPlanRepository } from '../../repositories/subscription-plan.repository';
import { IBenefitsRepository } from '../../../../benefits/repositories/benefit.repository';

export class CreateSubscriptionPlanController {
    constructor(
        private readonly subscriptionPlanRepository: ISubscriptionPlanRepository,
        private readonly itemRepository: IBenefitsRepository,    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const {
                item_uuid,
                name,
                description,
                price,
                billing_period,
                payer_type,
                is_active,
                currency,
            } = request.body;

            // Validação básica de presença dos campos obrigatórios antes de chamar o UseCase
            // (Validações de negócio mais profundas ocorrem dentro da Entidade)
            if (
                !item_uuid ||
                !name ||
                price === undefined ||
                !billing_period ||
                !payer_type
            ) {
                throw new CustomError(
                    'Campos obrigatórios faltando: item_uuid, name, price, billing_period, payer_type.',
                    400
                );
            }

            // Garantindo que os enums sejam válidos (o TypeScript ajuda, mas em runtime é bom garantir)
            if (!Object.values(BillingPeriod).includes(billing_period)) {
                throw new CustomError(
                    `Invalid billing_period. Must be one of: ${Object.values(BillingPeriod).join(', ')}`,
                    400
                );
            }
            if (!Object.values(PayerType).includes(payer_type)) {
                throw new CustomError(
                    `Invalid payer_type. Must be one of: ${Object.values(PayerType).join(', ')}`,
                    400
                );
            }

            const input: InputCreateSubscriptionPlanDto = {
                item_uuid,
                name,
                description,
                price: Number(price), // Garante que o preço seja um número (float/decimal em Reais)
                billing_period: billing_period as BillingPeriod,
                payer_type: payer_type as PayerType,
                is_active,
                currency,
            };

            const usecase = new CreateSubscriptionPlanUsecase(
                this.subscriptionPlanRepository,
                this.itemRepository,
            );
            const output = await usecase.execute(input);

            // Retorna 201 Created com os dados do plano criado
            return response.status(201).json(output);
        } catch (err: any) {
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
                return response.status(statusCode).json({
                    error: err.message || "Internal Server Error",
                });
        }
    }
}

import { Request, Response } from 'express';
import { GenerateBusinessContractUsecase } from './generate-business-contract.usecase';
import { IBusinessContractRepository } from '../../repositories/business-contract.repository';

export class GenerateBusinessContractController {
    constructor(
        private readonly repository: IBusinessContractRepository
    ) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // O UUID da empresa que o admin está gerando o contrato
            const { business_info_uuid } = request.params;

            if (!business_info_uuid) {
                return response.status(400).json({ error: 'O UUID da empresa é obrigatório.' });
            }

            const usecase = new GenerateBusinessContractUsecase(
                this.repository
            )

            const result = await usecase.execute({ business_info_uuid });

            return response.status(201).json(result);
        } catch (error: any) {
            console.error('[GenerateBusinessContractController] Erro:', error.message);

            if (error.statusCode) {
                return response.status(error.statusCode).json({ error: error.message });
            }

            return response.status(500).json({ error: 'Erro interno ao gerar o contrato comercial.' });
        }
    }
}
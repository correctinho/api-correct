import { Request, Response } from 'express';
import { GetPendingBusinessContractUsecase } from './get-pending-business-contract.usecase';
import { IBusinessContractRepository } from '../../repositories/business-contract.repository';

export class GetPendingBusinessContractController {
    constructor(
        private readonly repository: IBusinessContractRepository
    ) { }

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            // Como o lojista estará logado, você pode pegar o UUID da empresa 
            // direto do token de autenticação (request.user) ou via params.
            // Vou deixar via params para seguir o padrão padrão do projeto.
            const { business_info_uuid } = request.params;

            if (!business_info_uuid) {
                return response.status(400).json({ error: 'O UUID da empresa é obrigatório.' });
            }

            const usecase = new GetPendingBusinessContractUsecase(this.repository);

            const result = await usecase.execute({ business_info_uuid });

            return response.status(200).json(result);
        } catch (error: any) {
            console.error('[GetPendingBusinessContractController] Erro:', error.message);

            if (error.statusCode) {
                return response.status(error.statusCode).json({ error: error.message });
            }

            return response.status(500).json({ error: 'Erro interno ao buscar o contrato.' });
        }
    }
}
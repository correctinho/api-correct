import { Request, Response } from 'express';
import { SignPublicContractUsecase } from './sign-public-contract.usecase';
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";

export class SignPublicContractController {
    constructor(
        private businessInfoRepository: ICompanyDataRepository,
        private businessContractRepository: IBusinessContractRepository
    ) {}

    async handle(request: Request, response: Response): Promise<Response> {
        try {
            const { uuid } = request.params;
            if (!uuid) {
                return response.status(400).json({ error: 'UUID é obrigatório.' });
            }

            const usecase = new SignPublicContractUsecase(
                this.businessInfoRepository,
                this.businessContractRepository
            );

            const result = await usecase.execute(uuid);

            return response.status(200).json(result);
        } catch (error: any) {
            if (error.statusCode) {
                return response.status(error.statusCode).json({ error: error.message });
            }
            return response.status(400).json({
                error: error.message || 'Erro inesperado ao assinar o contrato.',
            });
        }
    }
}

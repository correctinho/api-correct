import { CustomError } from "../../../../../errors/custom.error";
import { GenerateBusinessContractUsecase } from "../../../../Terms/usecase/generate-business-contract/generate-business-contract.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";

export class GetPublicContractUsecase {
    constructor(
        private businessInfoRepository: ICompanyDataRepository,
        private businessContractRepository: IBusinessContractRepository,
        private generateUsecase: GenerateBusinessContractUsecase
    ) {}

    async execute(business_info_uuid: string) {
        // 1. Verificar se a empresa existe
        const business = await this.businessInfoRepository.findById(business_info_uuid);

        if (!business) {
            throw new CustomError("Empresa não encontrada.", 404);
        }

        // 2. Verificar se já existe um contrato gerado
        let contract = await this.businessContractRepository.findByBusinessId(business_info_uuid);

        // 3. Se não existir, gera o contrato
        if (!contract) {
            await this.generateUsecase.execute({ business_info_uuid });

            contract = await this.businessContractRepository.findByBusinessId(business_info_uuid);

            if (!contract) {
                throw new CustomError("Erro ao gerar ou buscar o contrato.", 500);
            }
        }

        return {
            uuid: contract.uuid,
            rendered_html: contract.rendered_html,
            status: contract.status,
            signed_at: contract.signed_at
        };
    }
}

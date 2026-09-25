import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";
import { BusinessStatus } from "@prisma/client";

export class SignPublicContractUsecase {
    constructor(
        private businessInfoRepository: ICompanyDataRepository,
        private businessContractRepository: IBusinessContractRepository
    ) {}

    async execute(business_info_uuid: string) {
        // 1. Verifica empresa e contrato
        const business = await this.businessInfoRepository.findById(business_info_uuid);
        if (!business) {
            throw new CustomError("Empresa não encontrada.", 404);
        }
        
        const contract = await this.businessContractRepository.findByBusinessId(business_info_uuid);
        if (!contract) {
            throw new CustomError("Contrato não encontrado.", 404);
        }

        if (contract.status === 'SIGNED') {
            throw new CustomError("Este contrato já foi assinado.", 400);
        }

        // 2. Atualiza o status do contrato para SIGNED
        await this.businessContractRepository.updateStatus(business_info_uuid, 'SIGNED');

        // 3. Atualiza o status da empresa para aguardando pagamento apenas se for a primeira vez
        // Se a empresa já é 'active' ou 'pending_approval' (ou seja, ela está apenas assinando um contrato de atualização de taxas),
        // não devemos regredir seu status para awaiting_payment, senão ela será cobrada novamente pelo PIX.
        if (business.status === BusinessStatus.pending_contract) {
            await this.businessInfoRepository.updateStatus(business_info_uuid, BusinessStatus.awaiting_payment);
        }

        return { message: "Contrato assinado com sucesso." };
    }
}

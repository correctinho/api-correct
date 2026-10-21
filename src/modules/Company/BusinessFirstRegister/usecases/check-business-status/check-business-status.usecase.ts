import { CustomError } from "../../../../../errors/custom.error";
import { IBusinessFirstRegisterRepository, CheckBusinessStatusResult } from "../../repositories/business-first-register.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";

export class CheckBusinessStatusUseCase {
    constructor(private repository: IBusinessFirstRegisterRepository, private contractRepository: IBusinessContractRepository) {}

    async execute(document: string): Promise<CheckBusinessStatusResult> {
        const cleanDoc = document.replace(/\D/g, "");

        const result = await this.repository.checkBusinessStatus(cleanDoc);

        if (!result) {
            throw new CustomError("Estabelecimento não encontrado", 404);
        }

        if (result.status === 'active' || result.status === 'pending_approval') {
            const contract = await this.contractRepository.findPendingByBusiness(result.uuid);
            if (contract) {
                result.status = 'pending_contract';
            }
        }

        return result;
    }
}

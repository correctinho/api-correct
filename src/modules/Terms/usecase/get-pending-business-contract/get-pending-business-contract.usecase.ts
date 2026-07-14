import { CustomError } from "../../../../errors/custom.error";
import { IBusinessContractRepository } from "../../repositories/business-contract.repository";
import { InputGetPendingBusinessContractDTO, OutputGetPendingBusinessContractDTO } from "./dto/get-pending-business-contract.dto";

export class GetPendingBusinessContractUsecase {
    constructor(
        private readonly repository: IBusinessContractRepository
    ) { }

    async execute(input: InputGetPendingBusinessContractDTO): Promise<OutputGetPendingBusinessContractDTO> {
        const contract = await this.repository.findPendingByBusiness(input.business_info_uuid);

        if (!contract) {
            throw new CustomError("Nenhum contrato pendente encontrado para esta empresa.", 404);
        }

        if (contract.status !== 'PENDING') {
            throw new CustomError("O contrato atual não está mais com status pendente.", 400);
        }

        return {
            uuid: contract.uuid,
            rendered_html: contract.rendered_html,
            status: contract.status,
        };
    }
}
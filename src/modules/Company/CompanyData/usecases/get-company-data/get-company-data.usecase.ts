import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { IBusinessContractRepository } from "../../../../Terms/repositories/business-contract.repository";

export class GetCompanyDataUsecase {
    constructor(
        private companyDataRepository: ICompanyDataRepository,
        private contractRepository: IBusinessContractRepository
    ) { }

    async execute(business_id: string) {

        if (!business_id) throw new CustomError("Business ID is required", 400)

        const getCompanyData = await this.companyDataRepository.findById(business_id)
        if (!getCompanyData) throw new CustomError("Company Data not registered", 400)

        if (getCompanyData.status === 'active' || getCompanyData.status === 'pending_approval') {
            const contract = await this.contractRepository.findPendingByBusiness(business_id);
            if (contract) {
                getCompanyData.status = 'pending_contract';
            }
        }

        return getCompanyData
    }
}
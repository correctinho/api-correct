import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";

export class GetCompanyDataUsecase {
    constructor(
        private companyDataRepository: ICompanyDataRepository,
    ) { }

    async execute(business_id: string) {

        if (!business_id) throw new CustomError("Business ID is required", 400)

        const getCompanyData = await this.companyDataRepository.findById(business_id)
        if (!getCompanyData) throw new CustomError("Company Data not registered", 400)

        return getCompanyData
    }
}
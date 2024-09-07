import { CustomError } from "../../../../../errors/custom.error";
import { CompanyAddressEntity, CompanyAddressProps } from "../../entities/company-address.entity";
import { ICompanyAddressRepository } from "../../repositories/company-address.repository";

export class UpdateCompanyDataAndAddressByAdminUsecase{
    constructor(
        private companyAddressRepository: ICompanyAddressRepository
    ){}

    async execute(data: CompanyAddressEntity){
        if(!data.uuid) throw new CustomError("Address Id is required", 400)

        //check if uuid exists
        const findAddress = await this.companyAddressRepository.findById(data.uuid)
        if(!findAddress) throw new CustomError("Address not found", 400)

        const updateCompanyAddress = await this.companyAddressRepository.update(data)

        return updateCompanyAddress
    }
}

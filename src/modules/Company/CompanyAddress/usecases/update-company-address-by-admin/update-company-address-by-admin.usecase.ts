import { CustomError } from "../../../../../errors/custom.error";
import { CompanyAddressEntity, CompanyAddressProps } from "../../entities/company-address.entity";
import { ICompanyAddressRepository } from "../../repositories/company-address.repository";

export class UpdateCompanyDataAndAddressByAdminUsecase{
    constructor(
        private companyAddressRepository: ICompanyAddressRepository
    ){}

    async execute(address_uuid: string, data: Partial<CompanyAddressProps>){
        if(!address_uuid) throw new CustomError("Address Id is required", 400)

        //check if uuid exists
        const findData = await this.companyAddressRepository.findById(address_uuid)
        if(!findData) throw new CustomError("Endereço não encontrado", 404)

        const mergedData = {
            uuid: findData.uuid,
            line1: data.line1 !== undefined ? data.line1 : findData.line1,
            line2: data.line2 !== undefined ? data.line2 : findData.line2,
            line3: data.line3 !== undefined ? data.line3 : findData.line3,
            postal_code: data.postal_code !== undefined ? data.postal_code : findData.postal_code,
            neighborhood: data.neighborhood !== undefined ? data.neighborhood : findData.neighborhood,
            city: data.city !== undefined ? data.city : findData.city,
            state: data.state !== undefined ? data.state : findData.state,
            country: data.country !== undefined ? data.country : findData.country
        }

        const entity = await CompanyAddressEntity.create(mergedData as CompanyAddressProps)

        const updateCompanyAddress = await this.companyAddressRepository.update(entity)

        return updateCompanyAddress
    }
}

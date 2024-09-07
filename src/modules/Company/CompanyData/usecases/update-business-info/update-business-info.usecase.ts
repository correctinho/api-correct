import { CustomError } from "../../../../../errors/custom.error";
import { CompanyDataEntity } from "../../entities/company-data.entity";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";

export class UpdateBusinessInfoUsecase {
    constructor(
        private businessInfoRepository: ICompanyDataRepository,

    ){}

    async execute(data: CompanyDataEntity){

        if(!data.uuid) throw new CustomError("Business info Id is required", 400)

        const findData = await this.businessInfoRepository.findById(data.uuid)
        if(!findData) throw new CustomError("Business info not found", 404)

        const updateBusinessInfoRepository = await this.businessInfoRepository.update(data)

        return updateBusinessInfoRepository
    }
}

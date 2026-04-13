import { CustomError } from "../../../../../errors/custom.error";
import { CompanyDataEntity } from "../../entities/company-data.entity";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";

export class UpdateBusinessInfoUsecase {
    constructor(
        private businessInfoRepository: ICompanyDataRepository,

    ) { }

    async execute(uuid: string, data: Partial<CompanyDataEntity>) {

        if (!uuid) throw new CustomError("Business info Id is required", 400)

        const findData = await this.businessInfoRepository.findById(uuid)
        if (!findData) throw new CustomError("Empresa não encontrada", 404)

        const mergedData = {
            uuid: findData.uuid,
            address_uuid: findData.address_uuid,
            fantasy_name: data.fantasy_name ?? findData.fantasy_name,
            corporate_reason: data.corporate_reason !== undefined ? data.corporate_reason : findData.corporate_reason,
            document: data.document ?? findData.document,
            classification: data.classification ?? findData.classification,
            colaborators_number: data.colaborators_number ?? findData.colaborators_number,
            status: data.status ?? findData.status,
            phone_1: data.phone_1 ?? findData.phone_1,
            phone_2: data.phone_2 !== undefined ? data.phone_2 : findData.phone_2,
            business_type: data.business_type ?? findData.business_type,
            email: data.email ?? findData.email,
            employer_branch: data.employer_branch !== undefined ? data.employer_branch : findData.employer_branch,
            payroll_closing_day: data.payroll_closing_day !== undefined ? data.payroll_closing_day : findData.payroll_closing_day,
            txt_delivery_day: data.txt_delivery_day !== undefined ? data.txt_delivery_day : findData.txt_delivery_day,
            created_at: findData.created_at,
            updated_at: findData.updated_at
        }

        const entity = await CompanyDataEntity.create(mergedData as any)

        const updateBusinessInfoRepository = await this.businessInfoRepository.update(entity)

        return updateBusinessInfoRepository
    }
}

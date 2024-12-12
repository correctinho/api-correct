import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../../CompanyUser/repositories/company-user.repository";
import { ICompanyDataRepository } from "../../repositories/company-data.repository";
import { InputGetRegisteredBusinessBySeller } from "./dto/get-registered-business-by-.seller.dto";

export class GetRegisteredBusinessCorrectSellerUsecase{
    constructor(
        private companyDataRepository: ICompanyDataRepository,
    ){}

    async execute(data: InputGetRegisteredBusinessBySeller){
        if(!data.business_document) throw new CustomError("Business Document is required", 400)
        //find by business document
        const partner = await this.companyDataRepository.findByDocument(data.business_document)
        if(!partner) throw new CustomError("Business not found", 404)
        if(partner.business_type === 'empregador') throw new CustomError("Business is not a partner", 400)

        //check if current seller has registered this business
        const relatedPartner = await this.companyDataRepository.findPartnerByCorrect(data.uuid, partner.uuid)
        if(!relatedPartner) throw new CustomError("Unauthorized access", 401)

        return {
          business_info_uuid: partner.uuid,
          business_document: partner.document,
          fantasy_name: partner.fantasy_name,

        }

    }
}

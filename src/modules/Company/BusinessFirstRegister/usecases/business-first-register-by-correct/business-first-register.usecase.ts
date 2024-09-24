import { CustomError } from "../../../../../errors/custom.error";
import { NewBusinessNotification } from "../../../../Notification/CorrectNotification/notification.service";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { BusinessRegisterEntity, BusinessRegisterProps } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";

export class CreateBusinessRegisterUsecase {
    constructor(
        private businessRegisterRepository: IBusinessFirstRegisterRepository,
        private companyDataRepository: ICompanyDataRepository
    ){}

    async execute(data: BusinessRegisterProps){
        const findBusiness = await this.companyDataRepository.findByDocument(data.document)
        if(findBusiness) throw new CustomError("Business already registered", 409)

        const register = await BusinessRegisterEntity.create(data)

        await this.businessRegisterRepository.save(register)

        const notififyCorrectAdmin = new NewBusinessNotification()

        await notififyCorrectAdmin.notififyCorrectAdmin({
          business_email: register.email,
          document: register.document,
          fantasy_name: register.fantasy_name,
          corporate_reason: register.corporate_reason
        })

        return {
          address_uuid: register.address_pk_uuid,
          line1: register.line1,
          line2: register.line2,
          line3: register.line3,
          neighborhood: register.neighborhood,
          postal_code: register.postal_code,
          city: register.city,
          state: register.state,
          country: register.country,
          business_info_uuid: register.business_info_uuid,
          address_fk_uuid: register.address_fk_uuid,
          fantasy_name: register.fantasy_name,
          document: register.document,
          corporate_reason: register.corporate_reason,
          branch_info_uuid: register.branch_info_uuid,
          classification: register.classification,
          colaborators_number: register.colaborators_number,
          status: register.status,
          phone_1: register.phone_1,
          phone_2: register.phone_2,
          business_type: register.business_type,
          email: register.email
        }
    }
}

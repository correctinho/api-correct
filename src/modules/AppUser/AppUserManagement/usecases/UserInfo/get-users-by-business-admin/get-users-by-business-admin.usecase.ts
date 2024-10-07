import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { AppUserInfoEntity } from "../../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputGetEmployeesByBusinessDTO } from "./dto/get-user-by-business.dto";

export class GetUsersByBusinessAdminUsecase{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
        private businessUserRepository: ICompanyUserRepository

    ){}

    async execute(businessInfoUuid: string){
        //find employees
        const employees = await this.appUsersRepository.findManyByBusiness(businessInfoUuid)
        if(employees.length === 0) return []
        return employees.map((employee: OutputGetEmployeesByBusinessDTO) => {
          return {
            uuid: employee.uuid,
            business_info_uuid: employee.business_info_uuid,
            address_uuid: employee.address_uuid ? employee.address_uuid : null,
            document: employee.document,
            document2: employee.document2,
            document3: employee.document3,
            full_name: employee.full_name,
            internal_company_code: employee.internal_company_code,
            gender: employee.gender,
            email: employee.email,
            date_of_birth: employee.date_of_birth,
            phone: employee.phone,
            salary: employee.salary,
            company_owner: employee.company_owner,
            status: employee.status,
            function: employee.function,
            is_authenticated: employee.is_authenticated,
            marital_status: employee.marital_status,
            dependents_quantity: employee.dependents_quantity,
            user_document_validation_uuid: employee.user_document_validation_uuid ? employee.user_document_validation_uuid : null,
            created_at: employee.created_at,
            updated_at: employee.updated_at,
            Address: employee.address_uuid ? {
              uuid: employee.Address.uuid,
              line1: employee.Address.line1,
              line2: employee.Address.line2,
              line3: employee.Address.line3,
              neighborhood: employee.Address.neighborhood,
              postal_code: employee.Address.postal_code,
              city: employee.Address.city,
              state: employee.Address.state,
              country: employee.Address.country
            } : null
          }
        })
    }
}

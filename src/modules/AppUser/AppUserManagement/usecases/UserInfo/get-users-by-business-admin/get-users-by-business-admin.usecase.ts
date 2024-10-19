import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { AppUserInfoEntity } from "../../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputGetEmployeesByBusinessDTO } from "./dto/get-user-by-business.dto";

export class GetUsersByBusinessAdminUsecase{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,

    ){}

    async execute(businessInfoUuid: string){
        //find employees
        const employees = await this.appUsersRepository.findManyByBusiness(businessInfoUuid)
        if(employees.length === 0) return []
        return employees.map((employee: any) => {
          return {
            uuid: employee.uuid,
            user_info_uuid: employee.UserInfo.uuid,
            business_info_uuid: employee.business_info_uuid,
            address_uuid: employee.UserInfo.address_uuid ? employee.UserInfo.address_uuid : null,
            document: employee.UserInfo.document,
            document2: employee.UserInfo.document2,
            document3: employee.UserInfo.document3,
            full_name: employee.UserInfo.full_name,
            internal_company_code:  employee.company_internal_code ? employee.company_internal_code : null,
            gender: employee.UserInfo.gender,
            email: employee.UserInfo.email,
            date_of_birth: employee.UserInfo.date_of_birth,
            phone: employee.UserInfo.phone,
            salary: employee.salary,
            company_owner: employee.company_owner,
            status: employee.UserInfo.status,
            function: employee.job_title,
            marital_status: employee.UserInfo.marital_status,
            dependents_quantity: employee.dependents_quantity,
            user_document_validation_uuid: employee.UserInfo.user_document_validation_uuid ? employee.UserInfo.user_document_validation_uuid : null,
            is_employee: employee.UserInfo.is_employee,
            created_at: employee.created_at,
            updated_at: employee.updated_at,
            Address: employee.UserInfo.address_uuid ? {
              uuid: employee.UserInfo.Address.uuid,
              line1: employee.UserInfo.Address.line1,
              line2: employee.UserInfo.Address.line2,
              line3: employee.UserInfo.Address.line3,
              neighborhood: employee.UserInfo.Address.neighborhood,
              postal_code: employee.UserInfo.Address.postal_code,
              city: employee.UserInfo.Address.city,
              state: employee.UserInfo.Address.state,
              country: employee.UserInfo.Address.country
            } : null
          }
        })
    }
}

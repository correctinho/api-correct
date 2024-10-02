import { CustomError } from "../../../../../../errors/custom.error";
import { OutputCompanyUserDTO } from "../../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { AppUserInfoEntity } from "../../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputGetEmployeesByBusinessDTO } from "./dto/get-user-by-business.dto";

export class GetUsersByBusinessAdminUsecase{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
        private businessUserRepository: ICompanyUserRepository

    ){}

    async execute(businessInfoUuid: string): Promise<OutputGetEmployeesByBusinessDTO[] | []>{

        //find employees
        const employees = await this.appUsersRepository.findManyByBusiness(businessInfoUuid)

        if(employees.length === 0) return []

        return employees.map((employee: AppUserInfoEntity) => {
          return {
            uuid: employee.uuid.uuid,
            business_info_uuid: employee.business_info_uuid.uuid,
            address_uuid: employee.address_uuid ? employee.address_uuid.uuid : null,
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
            user_document_validation_uuid: employee.user_document_validation_uuid ? employee.user_document_validation_uuid.uuid : null,
            created_at: employee.created_at,
            updated_at: employee.updated_at
          }
        })
    }
}

import { CustomError } from "../../../../../../errors/custom.error";
import { OutputCompanyUserDTO } from "../../../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";

export class GetUsersByBusinessAdminUsecase{
    constructor(
        private appUsersRepository: IAppUserInfoRepository,
        private businessUserRepository: ICompanyUserRepository

    ){}

    async execute(businessAdmin: OutputCompanyUserDTO){


        //find employees
        const employees = await this.appUsersRepository.findManyByBusiness(businessAdmin.businessInfoUuid)

        return employees
    }
}

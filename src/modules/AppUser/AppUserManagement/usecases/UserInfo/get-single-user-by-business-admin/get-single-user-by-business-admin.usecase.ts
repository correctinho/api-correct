import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";

export class GetSingleUserByBusinessAdminUsecase {
  constructor(
    private appUsersRepository: IAppUserInfoRepository,
    private businessUserRepository: ICompanyUserRepository

  ) { }

  async execute(employee_uuid: string,) {

    if (!employee_uuid) throw new CustomError("Employee uuid is requred", 400)

    const employee = await this.appUsersRepository.find(new Uuid(employee_uuid))


    if (!employee) throw new CustomError("Employee not found", 404)

    // if (business_user?.business_info_uuid !== employee.business_info_uuid) throw new CustomError("Unauthorized access", 401)


    return employee
  }
}

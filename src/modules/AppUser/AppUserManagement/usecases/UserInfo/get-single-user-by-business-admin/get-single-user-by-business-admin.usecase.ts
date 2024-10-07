import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputGetSingleemployeeByBusinessDTO } from "./dto/get-user-by-business.dto";

export class GetSingleUserByBusinessAdminUsecase {
  constructor(
    private appUsersRepository: IAppUserInfoRepository,
    private businessUserRepository: ICompanyUserRepository

  ) { }

  async execute(employee_uuid: string, business_info_uuid: string): Promise<OutputGetSingleemployeeByBusinessDTO> {

    if (!employee_uuid) throw new CustomError("Employee uuid is required", 400)

    const employee = await this.appUsersRepository.find(new Uuid(employee_uuid))
    if (!employee) throw new CustomError("Employee not found", 404)

    const isRelatedToBusiness = employee.business_info_uuids.some(business => business === business_info_uuid);
    if (!isRelatedToBusiness) throw new CustomError("Unauthorized access", 401);

    return {
      uuid: employee.uuid.uuid,
      business_info_uuid: business_info_uuid,
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
  }
}

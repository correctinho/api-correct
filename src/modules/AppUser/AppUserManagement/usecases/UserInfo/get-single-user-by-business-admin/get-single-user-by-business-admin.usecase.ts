import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../../../../Company/CompanyUser/repositories/company-user.repository";
import { AppUserInfoEntity } from "../../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { OutputGetSingleEmployeeByBusinessDTO } from "./dto/get-user-by-business.dto";

export class GetSingleUserByBusinessAdminUsecase {
  constructor(
    private appUsersRepository: IAppUserInfoRepository,
    private businessUserRepository: ICompanyUserRepository

  ) { }

  async execute(employee_document: string, business_info_uuid: string): Promise<OutputGetSingleEmployeeByBusinessDTO> {
    if (!employee_document) throw new CustomError("Employee document is required", 400)

    const documentNumber = this.processDocument(employee_document)

    const employee = await this.appUsersRepository.findByDocumentUserInfo(documentNumber)
    if (!employee) throw new CustomError("Employee not found", 404)
    const isRelatedToBusiness = employee.Employee.find(business => business.business_info_uuid === business_info_uuid);
    if (!isRelatedToBusiness) throw new CustomError("Unauthorized access", 401);

    return {
      uuid: employee.uuid,
      business_info_uuid: business_info_uuid,
      address_uuid: employee.address_uuid ? employee.address_uuid : null,
      document: employee.document,
      document2: employee.document2,
      document3: employee.document3,
      full_name: employee.full_name,
      internal_company_code: isRelatedToBusiness.internal_company_code,
      gender: employee.gender,
      email: employee.email,
      date_of_birth: employee.date_of_birth,
      phone: employee.phone,
      salary: isRelatedToBusiness.salary,
      company_owner: isRelatedToBusiness.company_owner,
      status: employee.status,
      is_employee: employee.is_employee,
      function: isRelatedToBusiness.function,
      marital_status: employee.marital_status,
      dependents_quantity: isRelatedToBusiness.dependents_quantity,
      user_document_validation_uuid: employee.user_document_validation_uuid ? employee.user_document_validation_uuid: null,
      created_at: employee.created_at,
      updated_at: employee.updated_at
    }
  }

  private processDocument(document: string) {
    const onlyNumbers = document.replace(/\D/g, '');
    return onlyNumbers
}
}

import { Permissions } from "@prisma/client"
import { CustomError } from "../../../../../errors/custom.error"
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository"
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity"
import { ICompanyUserRepository } from "../../repositories/company-user.repository"


export class CreateCompanyAdminUseCase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private companyDataRepository: ICompanyDataRepository
  ) { }

  async execute(data: CompanyUserProps) {
    const admin = await CompanyUserEntity.create(data)

    if (!admin.email) throw new CustomError("Email is required", 400)

    //if email exists, it means that it's an admin being created  Correct
    admin.is_admin = true

    //check if email is already registered in business info database
    const findByEmail = await this.companyDataRepository.findByEmail(admin.email)
    if (!findByEmail) throw new CustomError("Email not found in company registers", 400)

    if (findByEmail.status === 'pending_approval') throw new CustomError("Business must be validated before creating an Admin user", 401)
    if (findByEmail.status === 'inactive') throw new CustomError("Business has inactive status", 401)

    //if business info exists, relate to current user
    admin.business_info_uuid = findByEmail.uuid
    admin.permissions = [Permissions.all]

    //by default, admin status is 'pendind_password'
    admin.status = 'pending_password'

    //check if email already exists in users registers
    const companyUserByEmail = await this.companyUserRepository.findByEmail(admin.email)
    if (companyUserByEmail) throw new CustomError("Email already registered", 409)

    //create company admin
    await this.companyUserRepository.saveUser(admin)

    return {
      uuid: admin.uuid,
      business_info_uuid: admin.business_info_uuid,
      email: admin.email,
      document: admin.document,
      name: admin.name,
      is_admin: admin.is_admin,
      permissions: admin.permissions,
      user_name: admin.user_name,
      function: admin.function,
      status: admin.status
    }
  }
}

import { Permissions } from "@prisma/client"
import { CustomError } from "../../../../../errors/custom.error"
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository"
import { CompanyUserEntity, CompanyUserProps } from "../../entities/company-user.entity"
import { ICompanyUserRepository } from "../../repositories/company-user.repository"
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo"
import { InputCreateCompanyAdminDTO, OutputCreateCompanyAdminDTO } from "./dto/create-company-admin.dto"


export class CreateCompanyAdminUseCase {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private companyDataRepository: ICompanyDataRepository
  ) { }

  async execute(data: InputCreateCompanyAdminDTO): Promise<OutputCreateCompanyAdminDTO> {
    const adminDataEntity = {
      business_info_uuid: data.business_info_uuid ? new Uuid(data.business_info_uuid) : null,
      email: data.email ? data.email : null,
      document: data.document ? data.document : null,
      name: data.name ? data.name : null,
      is_admin: data.is_admin,
      permissions: data.permissions,
      user_name: data.user_name ? data.user_name : null,
      password: data.password ? data.password : null,
      function: data.function ? data.function : null,
      status: data.status,

    }

    if(!data.password) throw new CustomError("Password is required", 400)

    const admin = await CompanyUserEntity.create(adminDataEntity)

    if(!admin.name) throw new CustomError("Name is required", 400)
    if (!admin.email) throw new CustomError("Email is required", 400)

    //check if email is already registered in business info database
    const findByEmail = await this.companyDataRepository.findByEmail(admin.email)
    if (!findByEmail) throw new CustomError("Email not found in company registers", 400)

    if (findByEmail.status === 'pending_approval') throw new CustomError("Business must be validated before creating an Admin user", 401)
    if (findByEmail.status === 'inactive') throw new CustomError("Business has inactive status", 401)

    //if business info exists, relate to current user
    admin.changeBusinessInfoUuid(new Uuid(findByEmail.uuid))
    admin.changePermissions([Permissions.all])

    //by default, admin status is 'pendind_password'
    admin.changeStatus('pending_password')
    //check if email already exists in users registers
    const companyUserByEmail = await this.companyUserRepository.findByEmail(admin.email)
    if (companyUserByEmail) throw new CustomError("Email already registered", 409)

    //create company admin
    const adminCreated = await this.companyUserRepository.saveUser(admin)
    return {
      uuid: adminCreated.uuid.uuid,
      business_info_uuid: adminCreated.business_info_uuid.uuid,
      email: adminCreated.email,
      document: adminCreated.document,
      name: adminCreated.name,
      is_admin: adminCreated.is_admin,
      permissions: adminCreated.permissions,
      user_name: adminCreated.user_name,
      function: adminCreated.function,
      status: adminCreated.status,
      created_at: adminCreated.created_at
    }
  }
}

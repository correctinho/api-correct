import { randomUUID } from 'crypto'
import { CustomError } from '../../../../errors/custom.error'
import { PasswordBcrypt } from '../../../../crypto/password.bcrypt'
import { Permissions, Status } from '@prisma/client'

export type CompanyUserProps = {
  business_info_uuid: string,
  is_admin: boolean,
  document: string | null,
  name: string | null,
  email: string | null,
  user_name: string | null,
  password: string
  function: string | null
  permissions: Permissions[],
  status: Status
}

export class CompanyUserEntity {
  uuid: string
  business_info_uuid: string
  is_admin: boolean
  document: string | null
  name: string | null
  email: string | null
  user_name: string | null
  password: string
  function: string | null
  permissions: Permissions[]
  status: Status

  private constructor(props: CompanyUserProps) {
    this.uuid = randomUUID()
    this.business_info_uuid = props.business_info_uuid
    this.email = props.email
    this.document = props.document
    this.name = props.name
    this.is_admin = props.is_admin ?? false
    this.permissions = props.permissions
    this.user_name = props.user_name
    this.password = props.password
    this.function = props.function
    this.status = props.status
  }

  static async create(data: CompanyUserProps) {
    if (!data.password) throw new CustomError("Password is required", 400)
    if (!data.business_info_uuid) throw new CustomError("Business info is required", 400)

    const bcrypt = new PasswordBcrypt()
    const passwordHash = await bcrypt.hash(data.password)

    data.password = passwordHash

    const companyUser = new CompanyUserEntity(data)
    return companyUser

  }
}

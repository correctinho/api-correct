import { Status, Permissions } from "@prisma/client"

export type InputCreateCompanyUserEntityDTO = {
  business_info_uuid: string,
  is_admin: boolean,
  document: string | null,
  name: string | null,
  email: string | null,
  user_name: string | null,
  password: string
  function: string | null
  permissions: Permissions[]
  status: Status
  isAdmin: boolean
  adminStatus: Status

}

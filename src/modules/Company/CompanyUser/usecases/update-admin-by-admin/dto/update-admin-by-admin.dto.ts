import { Status, Permissions } from "@prisma/client"

export type InputUpdateBusinessAdminByAdminDTO = {
  uuid?: string
  business_info_uuid?: string,
  is_admin?: boolean,
  document?: string | null,
  name?: string | null,
  email?: string | null,
  user_name?: string | null,
  password?: string
  function?: string | null
  permissions?: Permissions[]
  status?: string
}

export type AdminCurrentData = {
  is_admin?: boolean,
  document?: string | null,
  name?: string | null,
  email?: string | null,
  user_name?: string | null,
  business_info_uuid?: string
  password?: string
  function?: string | null
  permissions?: Permissions[]
  status?: string
}

export type OutputUpdateBusinessAdminByAdminDTO = {
  uuid?: string
  business_info_uuid?: string,
  is_admin?: boolean,
  document?: string | null,
  name?: string | null,
  email?: string | null,
  user_name?: string | null,
  function?: string | null
  permissions?: Permissions[]
  status?: string
  created_at: string
  updated_at: string
}

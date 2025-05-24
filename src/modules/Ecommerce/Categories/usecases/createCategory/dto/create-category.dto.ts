/* eslint-disable prettier/prettier */

export type InputCreateCategoryDTO = {
  uuid: string
  name: string
  description: string | null
  correct_admin_uuid: string
}

export type OutputCreateCategoryDTO = {
  uuid: string
  name: string
  description: string | null
  created_at: string
}

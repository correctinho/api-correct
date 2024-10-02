export type InputGetEmployeesByBusinessDTO = {

}

export type OutputGetEmployeesByBusinessDTO = {
  uuid: string
  business_info_uuid: string
  address_uuid: string
  document: string
  document2: string
  document3: string
  full_name: string
  internal_company_code: string
  gender: string
  email: string
  date_of_birth: string
  phone: string
  salary: number
  company_owner: boolean
  status: string
  function: string
  is_authenticated: boolean
  marital_status: string
  dependents_quantity: number
  user_document_validation_uuid: string
  created_at: string
  updated_at: string
  Address: {
    uuid: string
    line1: string | null
    line2: string | null
    line3: string | null
    neighborhood: string | null
    postal_code: string
    city: string | null
    state: string | null
    country: string | null
  } | null
}

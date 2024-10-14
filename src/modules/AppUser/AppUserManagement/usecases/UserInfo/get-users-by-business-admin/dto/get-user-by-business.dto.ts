export type InputGetEmployeesByBusinessDTO = {

}

export type OutputGetEmployeesByBusinessDTO = {
  uuid: string,
  user_info_uuid: string,
  business_info_uuid: string
  salary: string,
  company_internal_code: string,
  function: string,
  company_owner: boolean,
  dependents_quantity: number
  created_at: string,
  updated_at: string,
  UserInfo: {
    uuid: string
    address_uuid: string
    document: string
    document2: string
    document3: string
    full_name: string
    gender: string
    email: string
    date_of_birth: string
    phone: string
    company_owner: boolean
    status: string
    is_authenticated: boolean
    marital_status: string
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
}

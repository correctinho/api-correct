import { Status, UserDocumentValidationStatus } from "@prisma/client"
import { Uuid } from "../../../@shared/ValueObjects/uuid.vo"
import { boolean } from "zod"


//App User auth
export interface InputCreateAppUserDTO {
  user_info_uuid: Uuid | null,
  document: string,
  email: string,
  password: string,
  is_active: boolean
}

export interface OutputCreateappUserDTO {
  uuid: string
  user_info_uuid: Uuid | null,
  document: string
  email: string
  is_active: boolean
}

export interface OutputFindByDocumentAuthDTO {
  uuid: Uuid
  document: string
  email: string
  password: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OutputfindByDocumentDTO {
  uuid: Uuid
  document: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}




export type OutputAppUserDetailsDTO = {
  status: boolean,
  UserAuthDetails: {
    uuid: string,
    user_info_uuid: string | null,
    document: string,
    email: string,
    created_at?: string,
    updated_at?: string,
  },
  UserInfo: boolean,
  UserAddress: boolean,
  UserValidation: boolean
}

export interface OutputGetByDocument {
  status: boolean,
  UserAuth: boolean,
  UserInfo: boolean,
  Address: boolean,
  UserValidation: {
    document_front_status: string
    document_back_status: string
    selfie_status: string
    document_selfie_status: string
  }
}


export type AppUserAuthResponseAuthentication = {
  uuid: string
  document: string
  password: string
  created_at: string
  updated_at: string
}
export type UpdateAppUserRequest = Omit<AppUserAuthResponseAuthentication, 'password'>
// export type AppUserAuthResponse = Omit<AppUserAuthResponseAuthentication, 'password'>

export type UserInfoResponse = {
  uuid: string
  business_info_uuid: string | null
  address_uuid: string | null
  document: string
  document2: string | null
  document3: string | null
  full_name: string
  display_name: string | null
  internal_company_code: string | null
  gender: string | null
  email: string | null
  date_of_birth: string
  phone: string | null
  salary: number | null
  company_owner: boolean
  status: Status
  function: string | null
  recommendation_code: string | null
  marital_status: string | null
  dependents_quantity: number
  created_at: string | null
  updated_at: string | null
  BusinessInfo: {
    fantasy_name: string
  } | null
  user_document_validation_uuid: string | null
  Address?: {
    uuid: string
    line1: string
    line2: string
    line3: string | null
    postal_code: string
    neighborhood: string
    city: string
    state: string
    country: string
  } | null
  UserValidation?: {
    uuid: string
    document_front_status: UserDocumentValidationStatus
    document_back_status: UserDocumentValidationStatus
    selfie_status: UserDocumentValidationStatus
    document_selfie_status: UserDocumentValidationStatus
    created_at: string | null
    updated_at: string | null


  } | null
  UserAuth?: {
    uuid: string
    document: string
    email: string
  } | null

}


export type AppUserAuthResponse = {
  uuid: string,
  user_info_uuid: string | null,
  document: string,
  email: string,
  created_at: string | null,
  updated_at: string | null,
  UserInfo: {
    uuid: string,
    business_info_uuid: string | null,
    document: string,
    document2: string | null,
    document3: string | null,
    full_name: string,
    display_name: string | null,
    internal_company_code: string | null,
    gender: string | null,
    email: string | null,
    date_of_birth: string
    phone: string | null
    salary: number | null
    company_owner: boolean,
    status: Status,
    function: string | null,
    recommendation_code: string | null
    is_authenticated: boolean
    marital_status: string | null
    dependents_quantity: number
    user_document_validation_uuid: string | null
    Address: {
      uuid: string
      line1: string
      line2: string
      line3: string | null
      postal_code: string
      neighborhood: string
      city: string
      state: string
      country: string
    } | null,
    UserValidation: {
      uuid: string
      //document_front_base64: string
      document_front_status: UserDocumentValidationStatus
      //document_back_base64: string
      document_back_status: UserDocumentValidationStatus
      //selfie_base64: string | null
      selfie_status: UserDocumentValidationStatus
      //document_selfie_base64: string
      document_selfie_status: UserDocumentValidationStatus
      created_at: string | null
      updated_at: string | null

    } | null

  }


}


export type UserValidation = {
  uuid: string
  //document_front_base64: string
  document_front_status: UserDocumentValidationStatus
  //document_back_base64: string
  document_back_status: UserDocumentValidationStatus
  //selfie_base64: string | null
  selfie_status: UserDocumentValidationStatus
  //document_selfie_base64: string
  document_selfie_status: UserDocumentValidationStatus
}

export type UserValidationUpdate = {
  uuid: string
  document_front_base64: string | null
  document_front_status: UserDocumentValidationStatus
  document_back_base64: string | null
  document_back_status: UserDocumentValidationStatus
  selfie_base64: string | null
  selfie_status: UserDocumentValidationStatus
  document_selfie_base64: string | null
  document_selfie_status: UserDocumentValidationStatus
}


export type AppUserInfoRequest = {
  internal_company_code: string | null,
  company_owner: boolean
  full_name: string,
  gender: string | null,
  document2: string | null,
  document: string,
  date_of_birth: string,
  marital_status: string | null,
  dependents_quantity: number
  user_function: string | null
  salary: number | null,
}

export type AppUserAuthRequest = {
  user_info_uuid: string | null,
  document: string,
  email: string
  created_at: string | null,
  updated_at: string | null,
}

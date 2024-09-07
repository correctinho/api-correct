import { randomUUID } from 'crypto'
import { CustomError } from '../../../../errors/custom.error'
import { BusinessStatus, BusinessTypeOptions } from '@prisma/client'

export type BusinessRegisterProps = {
  //address table
  line1: string
  line2: string
  line3: string | null
  postal_code: string
  neighborhood: string
  city: string
  state: string
  country: string

  //businessinfo
  address_fk_uuid: string
  fantasy_name: string
  corporate_reason: string | null
  document: string
  classification: string
  colaborators_number: number
  status: BusinessStatus
  phone_1: string
  phone_2: string | null
  business_type: BusinessTypeOptions
  email: string
  branches_uuid?: string[]
  employer_branch?: string | null
  items_uuid?: string[]
}

export class BusinessRegisterEntity {
  address_pk_uuid: string
  line1: string
  line2: string
  line3: string | null
  neighborhood: string
  postal_code: string
  city: string
  state: string
  country: string
  business_info_uuid
  address_fk_uuid: string
  fantasy_name: string
  corporate_reason: string | null
  document: string
  classification: string
  colaborators_number: number
  status: BusinessStatus
  phone_1: string
  phone_2: string | null
  business_type: BusinessTypeOptions
  email: string
  branches_uuid?: string[]
  employer_branch?: string | null
  items_uuid?: string[]


  private constructor(props: BusinessRegisterProps) {

    this.address_pk_uuid = randomUUID()
    this.line1 = props.line1
    this.line2 = props.line2
    this.line3 = props.line3
    this.neighborhood = props.neighborhood
    this.postal_code = props.postal_code
    this.city = props.city
    this.state = props.state
    this.country = props.country
    this.business_info_uuid = randomUUID()
    this.address_fk_uuid = this.address_pk_uuid
    this.fantasy_name = props.fantasy_name
    this.document = props.document
    this.corporate_reason = props.corporate_reason
    this.branches_uuid = props.branches_uuid ?? ['']
    this.classification = props.classification
    this.colaborators_number = props.colaborators_number
    this.status = props.status ?? 'pending_approval'
    this.phone_1 = props.phone_1
    this.phone_2 = props.phone_2
    this.business_type = props.business_type
    this.email = props.email
    this.employer_branch = props.employer_branch
    this.items_uuid = props.items_uuid ?? ['']
    this.validate()

  }

  validate() {
    if (!this.line1) throw new CustomError("Street is required", 400)
    if (!this.line2) throw new CustomError("Number is required", 400)
    if (!this.neighborhood) throw new CustomError("Neighborhood is required", 400)
    if (!this.postal_code) throw new CustomError("Zip Code is required", 400)
    if (!this.city) throw new CustomError("City is required", 400)
    if (!this.state) throw new CustomError("State is required", 400)
    if (!this.country) throw new CustomError("Country is required", 400)
    if (!this.fantasy_name) throw new CustomError("Fantasy name is required", 400)
    if (!this.document) throw new CustomError("Document is required", 400)
    if (!this.classification) throw new CustomError("Company classification is required", 400)
    if (!this.colaborators_number) throw new CustomError("Total employees is required", 400)
    if (!this.email) throw new CustomError("Email is required", 400)
    if (!this.phone_1) throw new CustomError("Telephone 1 is required", 400)
    if (!this.business_type) throw new CustomError("Business type is required", 400)
    if((this.business_type === 'autonomo_comercio' || this.business_type === 'comercio') && this.branches_uuid[0] === ''){
      throw new CustomError("Business branch is required", 400)
    }
    if(this.business_type === 'empregador' && this.items_uuid[0] === ''){
      throw new CustomError("Item is required", 400)
    }

  }
  static async create(data: BusinessRegisterProps) {
    const companyAddress = new BusinessRegisterEntity(data)
    return companyAddress
  }
}

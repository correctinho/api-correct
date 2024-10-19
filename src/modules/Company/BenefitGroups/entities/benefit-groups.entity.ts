import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"
import { CustomError } from "../../../../errors/custom.error"
import { newDateF } from "../../../../utils/date"

export type BenefitGroupsProps = {
  uuid?: Uuid
  group_name: string
  employer_item_details_uuid: Uuid
  value: number
  employee_uuid?: Uuid
  is_default?: boolean
  business_info_uuid: Uuid
}

export type BenefitGroupsCreateCommand = {
  //uuid?: Uuid
  group_name: string
  employer_item_details_uuid: Uuid
  value: number
  employee_uuid?: Uuid
  is_default?: boolean
  business_info_uuid: Uuid
}

export class BenefitGroupsEntity {
  private _uuid: Uuid
  private _group_name: string
  private _employer_item_details_uuid: Uuid
  private _value: number
  private _employee_uuid?: Uuid
  private _is_default?: boolean
  private _business_info_uuid: Uuid
  private _created_at: string
  private _updated_at?: string

  constructor(props: BenefitGroupsProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._group_name = props.group_name
    this._employer_item_details_uuid = props.employer_item_details_uuid
    this._value = props.value
    this._employee_uuid = props.employee_uuid
    this._is_default = props.is_default ?? false
    this._business_info_uuid = props.business_info_uuid
    this._created_at = newDateF(new Date())
    this._updated_at = newDateF(new Date())
  }

  get uuid(): Uuid {
    return this._uuid
  }

  get group_name(): string {
    return this._group_name
  }

  get employer_item_details_uuid(): Uuid {
    return this._employer_item_details_uuid
  }

  get value(): number {
    return this._value
  }

  get employee_uuid(): Uuid {
    return this._employee_uuid
  }

  get is_default():boolean {
    return this._is_default
  }

  get business_info_uuid(): Uuid {
    return this._business_info_uuid
  }

  get created_at(): string {
    return this._created_at
  }

  get updated_at(): string {
    return this._updated_at
  }

  changeUuid(uuid: Uuid){
    this._uuid = uuid
    this.validate()
  }

  changeGroupName(group_name: string) {
    this._group_name = group_name
    this.validate()

  }

  changeEmployerItem(employer_item_uuid: Uuid) {
    this._employer_item_details_uuid = employer_item_uuid
    this.validate()

  }

  changeValue(value: number) {
    this._value = value
    this.validate()
  }

  changeUserInfo(employee_uuid: Uuid) {
    this._employee_uuid = employee_uuid
    this.validate()
  }

  changeBusinessInfo(business_info_uuid: Uuid) {
    this._business_info_uuid = business_info_uuid
    this.validate()
  }

  changeIsDefault(is_default: boolean){
    this._is_default = is_default
    this.validate()
  }

  validate() {
    if (!this.group_name) throw new CustomError("Group name is required", 400)
    if (!this.value) throw new CustomError("Value is required", 400)
    if (!this.business_info_uuid) throw new CustomError("Business Info Uuid is required", 400);

  }

  static create(data: BenefitGroupsCreateCommand) {
    const group = new BenefitGroupsEntity(data)
    return group
  }
}

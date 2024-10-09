import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"
import { newDateF } from "../../../../utils/date"

export type BenefitGroupsProps = {
  uuid?: Uuid
  group_name: string
  employerItemDetails_uuids: string[]
  value: number
  user_info_uuids: string[]
  business_info_uuid: Uuid
}

export type BenefitGroupsCreateCommand = {
  uuid?: Uuid
  group_name: string
  employerItemDetails_uuids: string[]
  value: number
  user_info_uuids: string[]
  business_info_uuid: Uuid
}

export class BenefitGroupsEntity{
  private _uuid: Uuid
  private _group_name: string
  private _employerItemDetails_uuids: string[]
  private _value: number
  private _user_info_uuids: string[]
  private _business_info_uuid: Uuid
  private _created_at: string
  private _updated_at: string

  constructor(props: BenefitGroupsProps){
    this._uuid = props.uuid ?? new Uuid();
    this._group_name = props.group_name
    this._employerItemDetails_uuids = props.employerItemDetails_uuids
    this._value = props.value
    this._user_info_uuids = props.user_info_uuids
    this._business_info_uuid = props.business_info_uuid
    this._created_at = newDateF(new Date())
    this._updated_at = newDateF(new Date())
  }

  get uuid():Uuid {
    return this._uuid
  }

  get group_name(): string {
    return this._group_name
  }

  get employerItemDetails_uuids(): string[]{
    return this._employerItemDetails_uuids
  }

  get value(): number{
    return this._value
  }

  get user_info_uuids(): string[] {
    return this._user_info_uuids
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

  changeGroupName(group_name: string){
    this._group_name = group_name
  }

  changeEmployerItems(items: string[]){
    this._employerItemDetails_uuids = items
  }

  changeValue(value: number){
    this._value = value
  }

  changeUserInfo(user_infos: string[]){
    this._user_info_uuids = user_infos
  }


  static create(data: BenefitGroupsCreateCommand){
    const group = new BenefitGroupsEntity(data)
    return group
  }
}

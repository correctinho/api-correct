import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { newDateF } from "../../../../utils/date";

type BusinessItemDetailsProps = {
  uuid?: Uuid
  item_uuid: Uuid
  business_info_uuid: Uuid
  cycle_start_day?: number
  cycle_end_day?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type BusinessItemDetailsCreateCommand = {
  item_uuid: Uuid
  business_info_uuid: Uuid
  cycle_start_day?: number
  cycle_end_day?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export class BusinessItemsDetailsEntity {
  private _uuid: Uuid
  private _item_uuid: Uuid
  private _business_info_uuid: Uuid
  private _cycle_start_day?: number
  private _cycle_end_day?: number
  private _is_active: boolean
  private _created_at?: string
  private _updated_at?: string

  constructor(props: BusinessItemDetailsProps) {
    this._uuid = props.uuid ?? new Uuid()
    this._item_uuid = props.item_uuid
    this._business_info_uuid = props.business_info_uuid
    this._cycle_start_day = props.cycle_start_day
    this._cycle_end_day = props.cycle_end_day
    this._is_active = props.is_active
    this._created_at = newDateF(new Date())
    this._updated_at = newDateF(new Date())
    this.validate()
  }

  validate(){
    if(!this._item_uuid) throw new CustomError("Item is required", 400);
    if(!this._business_info_uuid) throw new CustomError("Business Info ID is required", 400);

  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get item_uuid(): Uuid {
    return this._item_uuid
  }

  get business_info_uuid(): Uuid {
    return this._business_info_uuid
  }

  get cycle_start_day(): number {
    return this._cycle_start_day
  }

  get cycle_end_day(): number {
    return this._cycle_end_day
  }

  get is_active():boolean {
    return this._is_active
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
  private updateCycleStartDay(endDay: number) {
    this._cycle_start_day = endDay + 1;
    this.validate()
  }

  changeCycleEndDay(endDay: number) {
    this._cycle_end_day = endDay;
    this.updateCycleStartDay(endDay);
    this.validate();
  }

  activateEmployerItem(){
    this._is_active = true
  }

  deactivateEmployerItem(){
    this._is_active = false
  }


  static create(data: BusinessItemDetailsCreateCommand){
    const item = new BusinessItemsDetailsEntity(data)
    return item
  }

}

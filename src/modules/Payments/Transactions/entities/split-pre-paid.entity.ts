export class SplitPrePaidEntity {
  private _uuid: string
  private _user_item_uuid: string
  private _favored_user_uuid: string
  private _favored_business_info_uuid: string
  private _amount: number
  private _fee_amount: number
  private _cashback: number
  private _description: string
  private _status: string
  private _transaction_type: string
  private _created_at: Date
  private _updated_at: Date

  constructor (props: any) {
    this._uuid = props.uuid
    this._user_item_uuid = props.user_item_uuid
    this._favored_user_uuid = props.favored_user_uuid
    this._favored_business_info_uuid = props.favored_business_info_uuid
    this._amount = props.amount
    this._fee_amount = props.fee_amount
    this._cashback = props.cashback
    this._description = props.description
    this._status = props.status
    this._transaction_type = props.transaction_type
    this._created_at = new Date(props.created_at)
    this._updated_at = new Date(props.updated_at)
  }
}

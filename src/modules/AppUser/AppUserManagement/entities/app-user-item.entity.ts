import { UserItemStatus } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { newDateF } from "../../../../utils/date";
import { CustomError } from "../../../../errors/custom.error";

export type AppUserItemProps = {
  uuid?: Uuid
  user_info_uuid: Uuid
  item_uuid: Uuid
  item_name?: string
  balance: number
  status: UserItemStatus
  blocked_at?: string
  cancelled_at?: string
  block_reason?: string
  cancel_reason?: string
  grace_period_end_date?: string
  created_at?: string
  updated_at?: string
}

export type AppUserItemCreateCommand = {
  user_info_uuid: Uuid
  item_uuid: Uuid
  item_name?: string
  balance: number
  status: UserItemStatus
  blocked_at?: string
  cancelled_at?: string
  block_reason?: string
  cancel_reason?: string
  grace_period_end_date?: string
  created_at?: string
  updated_at?: string
}

export class AppUserItemEntity {
  private _uuid?: Uuid
  private _user_info_uuid: Uuid
  private _item_uuid: Uuid
  private _item_name?: string
  private _balance: number
  private _status: UserItemStatus
  private _blocked_at?: string
  private _cancelled_at?: string
  private _block_reason?: string
  private _cancel_reason?: string
  private _grace_period_end_date?: string
  private _created_at?: string
  private _updated_at?: string

  constructor(props: AppUserItemProps) {
    this._uuid = props.uuid ?? new Uuid()
    this._user_info_uuid = props.user_info_uuid
    this._item_uuid = props.item_uuid
    this._item_name = props.item_name
    this._balance = props.balance
    this._status = props.status
    this._blocked_at = props.blocked_at
    this._cancelled_at = props.cancel_reason
    this._block_reason = props.block_reason
    this._cancel_reason = props.cancel_reason
    this._grace_period_end_date = props.grace_period_end_date
    this._created_at = newDateF(new Date())
    this._updated_at = newDateF(new Date())
    this.validate()
  }

  get uuid(): Uuid {
    return this._uuid
  }

  get user_info_uuid(): Uuid {
    return this._user_info_uuid
  }

  get item_uuid(): Uuid {
    return this._item_uuid
  }

  get item_name(): string {
    return this._item_name
  }

  get balance(): number {
    return this._balance
  }

  get status(): UserItemStatus {
    return this._status
  }

  get blocked_at(): string | undefined {
    return this._blocked_at
  }

  get cancelled_at(): string | undefined {
    return this._cancelled_at
  }

  get block_reason(): string | undefined {
    return this._block_reason
  }

  get cancel_reason(): string | undefined {
    return this._cancel_reason
  }

  get grace_period_end_date(): string | undefined {
    return this._grace_period_end_date
  }

  get created_at(): string | undefined {
    return this._created_at
  }

  get updated_at(): string | undefined {
    return this._updated_at
  }

  changeBalance(balance: number) {
    this._balance = balance;
    this.validate();
  }

  blockUserItem() {
    this._status = "blocked"
  }

  activateStatus() {
    this._status = "active"
  }

  cancelUserItem() {
    this._status = 'cancelled'
  }

  changeItemName(itemName: string) {
    this._item_name = itemName;
    this.validate();
  }

  changeBlockedAt(blockedAt: string | undefined) {
    this._blocked_at = blockedAt;
    this.validate();
  }

  changeCancelledAt(cancelledAt: string | undefined) {
    this._cancelled_at = cancelledAt;
    this.validate();
  }

  changeBlockReason(blockReason: string | undefined) {
    this._block_reason = blockReason;
    this.validate();
  }

  changeCancelReason(cancelReason: string | undefined) {
    this._cancel_reason = cancelReason;
    this.validate();
  }

  changeGracePeriodEndDate(gracePeriodEndDate: string | undefined) {
    this._grace_period_end_date = gracePeriodEndDate;
    this.validate();
  }


  validate() {
    if (!this._user_info_uuid) throw new CustomError("User Info id is required", 400)
    if (!this._item_uuid) throw new CustomError("Item id is required", 400)
    if (this._balance < 0) throw new CustomError("Balance cannot be negative", 400);

    if (typeof this._balance !== 'number' || isNaN(this._balance)) throw new CustomError("Balance must be a valid number", 400);

    // Validação do status
    if (!Object.values(UserItemStatus).includes(this._status)) {
      throw new CustomError("Invalid status", 400);
    }
  }

  static create(data: AppUserItemCreateCommand) {
    const userItem = new AppUserItemEntity(data)
    return userItem
  }
}

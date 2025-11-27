import { ItemCategory, ItemType, UserItemStatus } from "@prisma/client";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { addDaysToDate, newDateF } from "../../../../utils/date";

/**
 * Propriedades para reconstruir a entidade a partir do banco de dados.
 */
export type AppUserItemProps = {
    uuid?: Uuid;
    user_info_uuid: Uuid;
    business_info_uuid: Uuid | null;
    item_uuid: Uuid;
    item_name: string;
    item_category?: ItemCategory;
    item_type?: ItemType;
    fantasy_name?: string | null;
    img_url?: string | null;
    balance: number; // Em centavos
    status: UserItemStatus;
    group_uuid: Uuid | null;
    group_name?: string;
    group_value?: number; // Em centavos
    group_is_default?: boolean;
    employee_salary?: number; // Em centavos
    blocked_at?: string | null;
    cancelled_at?: string | null;
    cancelling_request_at?: string | null;
    block_reason?: string | null;
    cancel_reason?: string | null;
    grace_period_end_date?: string | null;
    created_at?: string;
    updated_at?: string;
};

/**
 * Comando para criar uma NOVA entidade a partir da API/Usecase.
 * Valores monetários (`balance`) vêm no formato amigável (Reais).
 */
export type AppUserItemCreateCommand = {
    user_info_uuid: Uuid;
    business_info_uuid: Uuid | null;
    item_uuid: Uuid;
    item_name: string;
    item_category: ItemCategory;
    item_type?: ItemType;
    fantasy_name?: string | null;
    balance: number; // Em Reais (ex: 500.00)
    status: UserItemStatus;
    group_uuid: Uuid | null;
    group_value: number; // Em Reais
    group_name: string;
    group_is_default: boolean;
    employee_salary?: number; // Em Reais
    img_url?: string | null;
};

export class AppUserItemEntity {
    private _uuid: Uuid;
    private _user_info_uuid: Uuid;
    private _business_info_uuid: Uuid | null;
    private _item_uuid: Uuid;
    private _item_name: string;
    private _item_category: ItemCategory;
    private _item_type: ItemType;
    private _img_url: string | null;
    private _balance: number; // Armazenado internamente como centavos
    private _status: UserItemStatus;
    private _fantasy_name: string | null;
    private _group_uuid: Uuid | null;
    private _group_name: string;
    private _group_value: number; // Armazenado internamente como centavos
    private _group_is_default: boolean;
    private _employee_salary?: number;
    private _blocked_at: string | null;
    private _cancelled_at: string | null;
    private _cancelling_request_at: string | null;
    private _block_reason: string | null;
    private _cancel_reason: string | null;
    private _grace_period_end_date: string | null;
    private _created_at: string;
    private _updated_at: string;

    private constructor(props: AppUserItemProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._user_info_uuid = props.user_info_uuid;
        this._business_info_uuid = props.business_info_uuid ??  null;
        this._item_uuid = props.item_uuid;
        this._item_name = props.item_name;
        this._item_category = props.item_category;
        this._item_type = props.item_type;
        this._img_url = props.img_url ?? null;
        this._balance = props.balance;
        this._status = props.status;
        this._fantasy_name = props.fantasy_name ?? null
        this._group_uuid = props.group_uuid ?? null;
        this._group_name = props.group_name;
        this._group_value = props.group_value;
        this._group_is_default = props.group_is_default;
        this._employee_salary = props.employee_salary;
        this._blocked_at = props.blocked_at ?? null;
        this._cancelled_at = props.cancelled_at ?? null;
        this._cancelling_request_at = props.cancelling_request_at ?? null;
        this._block_reason = props.block_reason ?? null;
        this._cancel_reason = props.cancel_reason ?? null;
        this._grace_period_end_date = props.grace_period_end_date ?? null;
        this._created_at = props.created_at ?? newDateF(new Date());
        this._updated_at = props.updated_at ?? newDateF(new Date());
        this.validate();
    }

    // --- GETTERS (Retornam valores em formato amigável) ---
    get uuid(): Uuid { return this._uuid; }
    get user_info_uuid(): Uuid { return this._user_info_uuid; }
    get business_info_uuid(): Uuid { return this._business_info_uuid; }
    get item_uuid(): Uuid { return this._item_uuid; }
    get item_name(): string { return this._item_name; }
    get item_category(): ItemCategory { return this._item_category; }
    get item_type(): ItemType { return this._item_type; }
    get img_url(): string | null { return this._img_url; }
    get balance(): number { return this._balance / 100; }
    get status(): UserItemStatus { return this._status; }
    get fantasy_name(): string | null { return this._fantasy_name; }
    get group_uuid(): Uuid { return this._group_uuid; }
    get group_name(): string { return this._group_name; }
    get group_value(): number { return this._group_value / 100; }
    get group_is_default(): boolean { return this._group_is_default; }
    get employee_salary(): number | undefined { return this._employee_salary ? this._employee_salary / 100 : undefined; }
    get blocked_at(): string | null { return this._blocked_at; }
    get cancelled_at(): string | null { return this._cancelled_at; }
    get cancelling_request_at(): string | null { return this._cancelling_request_at; }
    get block_reason(): string | null { return this._block_reason; }
    get cancel_reason(): string | null { return this._cancel_reason; }
    get grace_period_end_date(): string | null { return this._grace_period_end_date; }
    get created_at(): string { return this._created_at; }
    get updated_at(): string { return this._updated_at; }

    // --- MÉTODOS DE ALTERAÇÃO DE ESTADO ---
    private touch(): void { this._updated_at = newDateF(new Date()); }
    
      changeImgUrl(img_url: string) {
    this._img_url = img_url
    this.validate()
  }

  changeBalance(balance: number) {
    this._balance = balance * 100;
    this.validate();
  }

  blockUserItem() {
    this._status = "blocked"
    this.validate()
  }

  activateStatus() {
    this._status = "active"
    this.validate()
  }

  cancelPostPaidUserItem() {
    this._status = 'cancelled'

    const cancelledAt = newDateF(new Date())
    this.changeCancelledAt(cancelledAt)
    this.validate()
  }

  private cancelPrePaidUserItem() {
    this._status = 'to_be_cancelled'
    this.validate()
  }

  changeGroupUuid(group_uuid: Uuid) {
    this._group_uuid = group_uuid
    this.validate()
  }

  changeGroupValue(group_value: number) {
    this._group_value = group_value * 100;
    this.validate();
  }

  async scheduleCancelling() {
    this.cancelPrePaidUserItem()

    const requestedAt = newDateF(new Date())

    this.changeCancellingRequestAt(requestedAt)

    //add 60 days
    const dateToCancel = await addDaysToDate(requestedAt, 60)

    this.changeGracePeriodEndDate(dateToCancel)
    this.validate()
  }

  changeUserInfoUuid(user_info_uuid: Uuid) {
    this._user_info_uuid = user_info_uuid
    this.validate()
  }
  changeItemName(itemName: string) {
    this._item_name = itemName;
    this.validate();
  }

  changeBlockedAt(blockedAt: string | undefined) {
    this._blocked_at = blockedAt;
    this.validate();
  }

  private changeCancelledAt(cancelledAt: string | undefined) {
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

  private changeCancellingRequestAt(cancelRequestAt: string | undefined) {
    this._cancelling_request_at = cancelRequestAt
    this.validate()
  }

  public toJSON(){
    return {
      uuid: this._uuid.uuid,
      user_info_uuid: this._user_info_uuid ? this._user_info_uuid.uuid : null,
      business_info_uuid: this._business_info_uuid ? this._business_info_uuid.uuid : null,
      item_uuid: this._item_uuid.uuid,
      item_name: this._item_name,
      item_category: this._item_category,
      item_type: this._item_type,
      img_url: this._img_url,
      balance: this._balance,
      status: this._status,
      fantasy_name: this._fantasy_name,
      group_uuid: this._group_uuid ? this._group_uuid.uuid : null,
      group_name: this._group_name,
      group_value: this._group_value,
      group_is_default: this._group_is_default,
      employee_salary: this._employee_salary,
      blocked_at: this._blocked_at,
      cancelled_at: this._cancelled_at,
      cancelling_request_at: this._cancelling_request_at,
      block_reason: this._block_reason,
      cancel_reason: this._cancel_reason,
      grace_period_end_date: this._grace_period_end_date,
      created_at: this._created_at,
      updated_at: this._updated_at
    }
  }
    
    // --- SERIALIZAÇÃO E VALIDAÇÃO ---
    private validate(): void {
        if (!this._user_info_uuid) throw new CustomError("User Info id is required", 400);
        if (!this._item_uuid) throw new CustomError("Item id is required", 400);
        if (this._balance < 0) throw new CustomError("Balance cannot be negative", 400);
        if(this.item_name !== "Correct" && this._balance > this._group_value) throw new CustomError("Balance cannot be higher than group value setup", 400);
        if (typeof this._balance !== 'number' || isNaN(this._balance)) throw new CustomError("Balance must be a valid number", 400);
        if (!Object.values(UserItemStatus).includes(this._status)) throw new CustomError("Invalid status", 400);
        // if (this._item_category === 'pos_pago' && this._employee_salary !== undefined && this._balance > (this._employee_salary * 0.4)) {
        //     throw new CustomError("Balance for 'pos_pago' category cannot exceed 40% of the employee's salary", 400);
        // }
    }
    
    // --- MÉTODOS DE FÁBRICA ---
    public static create(command: AppUserItemCreateCommand): AppUserItemEntity {
        const props: AppUserItemProps = {
            ...command,
            balance: Math.round(command.balance * 100),
            group_value: Math.round(command.group_value * 100),
            employee_salary: command.employee_salary ? Math.round(command.employee_salary * 100) : undefined
        };
        return new AppUserItemEntity(props);
    }

    public static hydrate(props: AppUserItemProps): AppUserItemEntity {
        return new AppUserItemEntity(props);
    }
}
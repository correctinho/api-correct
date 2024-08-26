import { CustomError } from '../../../errors/custom.error';
import { ItemType, ItemCategory } from '../usecases/create-benefit/create-benefit.dto';
import { Uuid } from '../../../@shared/ValueObjects/uuid.vo';
import { BenefitValidatorFactory } from '../benefit.validator';

export type BenefitsProps = {
  uuid?: Uuid
  name: string;
  description: string;
  item_type: ItemType;
  item_category: ItemCategory;
  parent_uuid: Uuid | null
  created_at?: string
  updated_at?: string
};

export type BenefitCreateCommand = {
  name: string;
  description: string;
  item_type: ItemType;
  item_category: ItemCategory;
  parent_uuid: Uuid | null
  created_at?: string
  updated_at?: string
}

export class BenefitsEntity {
  private _uuid: Uuid;
  private _name: string;
  private _description: string;
  private _item_type: ItemType;
  private _item_category: ItemCategory;
  private _parent_uuid: Uuid | null
  private _created_at?: string
  private _updated_at?: string

  constructor(props: BenefitsProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._name = props.name;
    this._description = props.description;
    this._item_type = props.item_type;
    this._item_category = props.item_category;
    this._parent_uuid = props.parent_uuid
    this._created_at = props.created_at
    this._updated_at = props.updated_at
    this.validate();
  }

  validate() {
    if (!this._name) throw new CustomError('Name is required', 400);
    if (!this._description) throw new CustomError('Description is required', 400);
    if (!this._item_type) throw new CustomError('Item type is required', 400);
    if (!this._item_category) throw new CustomError('Item category is required', 400);
  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get item_type(): ItemType {
    return this._item_type;
  }

  get item_category(): ItemCategory {
    return this._item_category;
  }

  get parent_uuid(): Uuid | null {
    return this._parent_uuid || null
  }

  get created_at(): string | null {
    return this._created_at || null
  }

  get updated_at(): string | null {
    return this._updated_at || null
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  changeDescription(description: string) {
    this._description = description;
    this.validate();
  }

  changeItemType(item_type: ItemType) {
    this._item_type = item_type;
    this.validate();
  }

  changeItemCategory(item_category: ItemCategory) {
    this._item_category = item_category;
    this.validate();
  }

  changeParentUuid(parent_uuid: Uuid | null) {
    this._parent_uuid = parent_uuid
    this.validate()
  }

  static create(data: BenefitCreateCommand) {
    const benefit = new BenefitsEntity(data)
    return benefit
  }
}

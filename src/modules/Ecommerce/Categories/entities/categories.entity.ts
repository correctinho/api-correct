import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../errors/custom.error';
import { newDateF } from '../../../../utils/date';

export type CategoryProps = {
  uuid?: Uuid;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CategoryCreateCommand = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class CategoryEntity {
  _uuid: Uuid;
  _name: string;
  _description: string | null;
  _is_active: boolean;
  _created_at: string;
  _updated_at: string;

  constructor(props: CategoryProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._name = props.name;
    this._description = props.description ?? null;
    this._is_active = props.is_active ?? true;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());
    this.validate();
  }

  validate() {
    if (!this.name)
      throw new CustomError('Name is required', 400);
  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get is_active(): boolean {
    return this._is_active;
  }

  get created_at(): string {
    return this._created_at;
  }

  get updated_at(): string {
    return this._updated_at;
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  changeDescription(description: string) {
    this._description = description;
    this.validate();
  }

  activate() {
    this._is_active = true;
  }

  deactivate() {
    this._is_active = false;
  }

  toJSON() {
    return {
      uuid: this._uuid,
      name: this._name,
      description: this.description,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this.updated_at,
    };
  }

  static create(props: CategoryCreateCommand) {
    return new CategoryEntity(props);
  }
}

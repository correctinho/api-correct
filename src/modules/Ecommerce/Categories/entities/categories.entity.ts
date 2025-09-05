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
  private _uuid: Uuid;
  private _name: string;
  private _description: string | null;
  private _is_active: boolean;
  private _created_at: string;
  private _updated_at: string;

  private constructor(props: CategoryProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._name = props.name;
    this._description = props.description ?? null;
    this._is_active = props.is_active ?? true;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());
    this.validate();
  }

  private validate(): void {
    if (!this._name || typeof this._name !== 'string') {
      throw new CustomError('Name is required and must be a string.', 400);
    }
    if (this._description && typeof this._description !== 'string') {
      throw new CustomError('Description must be a string.', 400);
    }
  }

  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get is_active(): boolean { return this._is_active; }
  get created_at(): string { return this._created_at; }
  get updated_at(): string { return this._updated_at; }

  // --- Métodos de Alteração de Estado ---
  changeName(name: string): void {
    this._name = name;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  changeDescription(description: string): void {
    this._description = description;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  activate(): void {
    this._is_active = true;
    this._updated_at = newDateF(new Date());
  }

  deactivate(): void {
    this._is_active = false;
    this._updated_at = newDateF(new Date());
  }

  // --- Serialização e Fábricas ---
  toJSON() {
    return {
      uuid: this._uuid.uuid, // Retorna a string do UUID
      name: this._name,
      description: this._description,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }

  public static create(props: CategoryCreateCommand): CategoryEntity {
    const categoryProps: CategoryProps = {
      ...props
    };
    return new CategoryEntity(categoryProps);
  }

  public static hydrate(props: CategoryProps): CategoryEntity {
    return new CategoryEntity(props);
  }
}
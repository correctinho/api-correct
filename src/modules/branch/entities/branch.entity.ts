import { randomUUID } from 'crypto';
import { CustomError } from '../../../errors/custom.error';

export type BranchProps = {
  uuid?: string;
  name: string;
  benefits_uuid?: string[];
  benefits_name?: string[]
  marketing_tax: number;
  admin_tax: number;
  market_place_tax: number;
  created_at?: string;
  updated_at?: string;
};

export type BranchCreateCommand = {
  name: string;
  benefits_uuid?: string[];
  benefits_name?: string[]
  marketing_tax: number;
  admin_tax: number;
  market_place_tax: number;
  created_at?: string;
  updated_at?: string;
}

export class BranchEntity {
  private _uuid: string;
  private _name: string;
  private _benefits_uuid: string[];
  private _benefits_name: string[]
  private _marketing_tax: number;
  private _admin_tax: number;
  private _market_place_tax: number;
  private _created_at: string;
  private _updated_at: string;

  private constructor(props: BranchProps) {
    this._uuid = props.uuid ? props.uuid : randomUUID();
    this._name = props.name;
    this._benefits_uuid = props.benefits_uuid || []
    this._benefits_name = props.benefits_name || []
    this._marketing_tax = props.marketing_tax;
    this._admin_tax = props.admin_tax;
    this._market_place_tax = props.market_place_tax
    this._created_at = props.created_at ?? randomUUID()
    this._updated_at = props.updated_at ?? randomUUID()
    this.validate()
  }

  get uuid(): string {
    return this._uuid
  }

  get name(): string {
    return this._name
  }

  get benefits_uuid(): string[] {
    return this._benefits_uuid
  }

  get benefits_name(): string[] {
    return this._benefits_name
  }

  get marketing_tax(): number {
    return this._marketing_tax
  }

  get admin_tax(): number {
    return this._admin_tax
  }

  get market_place_tax(): number {
    return this._market_place_tax
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

  changeBenefitsUuid(benefits_uuid: string[]) {
    this._benefits_uuid = benefits_uuid
    this.validate();
  }
  changeMarketingTax(marketing_tax: number) {
    this._marketing_tax = marketing_tax;
    this.validate();
  }

  changeAdminTax(admin_tax: number) {
    this._admin_tax = admin_tax;
    this.validate();
  }

  changeMarketPlaceTax(market_place_tax: number) {
    this._market_place_tax = market_place_tax;
    this.validate();
  }

  validate() {
    if (!this._name) throw new CustomError('Branch name is required', 400);
    // if (this._benefits_uuid.length === 0 && this._benefits_name.length === 0)
    //   throw new CustomError(
    //     'Invalid benefits group. One or more benefits is required',
    //     400
    //   );

  }
  static create(data: BranchCreateCommand) {
    const branch = new BranchEntity(data);
    return branch;
  }
}

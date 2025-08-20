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
    this._benefits_uuid = props.benefits_uuid || [];
    this._benefits_name = props.benefits_name || [];
    this._marketing_tax = props.marketing_tax;
    this._admin_tax = props.admin_tax;
    this._market_place_tax = props.market_place_tax;
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
    return this._marketing_tax / 10000
  }

  get admin_tax(): number {
    return this._admin_tax / 10000
  }

  get market_place_tax(): number {
    return this._market_place_tax / 10000
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

  public toJSON() {
    return {
      uuid: this._uuid, // Assumindo que Uuid tem uma propriedade .value
      name: this._name,
      marketing_tax: this._marketing_tax,
      admin_tax: this._admin_tax,
      market_place_tax: this._market_place_tax,
      created_at: this._created_at,
      updated_at: this._updated_at
      // Adicione outras propriedades que precisam ser salvas
    };
  }

  validate() {
    if (!this._name) throw new CustomError('Branch name is required', 400);
    // if (this._benefits_uuid.length === 0 && this._benefits_name.length === 0)
    //   throw new CustomError(
    //     'Invalid benefits group. One or more benefits is required',
    //     400
    //   );

  }

  public static hydrate(props: BranchProps): BranchEntity {
    // Apenas chama o construtor com os dados brutos (inteiros), sem conversão.
    return new BranchEntity(props);
  }
  public static create(data: BranchCreateCommand): BranchEntity {
    // Prepara as props para o construtor, aplicando a regra de negócio aqui.
    const propsForConstructor: BranchProps = {
      ...data,
      benefits_uuid: [], // Inicializado aqui, preenchido no use case
      admin_tax: Math.round(data.admin_tax * 10000),
      marketing_tax: Math.round(data.marketing_tax * 10000),
      market_place_tax: Math.round(data.market_place_tax * 10000),
    };
    const branch = new BranchEntity(propsForConstructor);
    return branch;
  }
}

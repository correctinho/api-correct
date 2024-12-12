import { CustomError } from '../../../../errors/custom.error';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { newDateF } from '../../../../utils/date';

export type PartnerCategory = 'saude' | 'cultura' | 'comercio';

export type PartnerConfigProps = {
  uuid?: Uuid;
  business_info_uuid: Uuid;
  main_branch?: Uuid;
  partner_category: PartnerCategory[];
  items_uuid: string[];
  admin_tax: number;
  marketing_tax: number;
  use_marketing: boolean
  market_place_tax: number;
  use_market_place: boolean;
};

export class PartnerConfigEntity {
  private _uuid?: Uuid;
  private _business_info_uuid: Uuid;
  private _main_branch?: Uuid;
  private _partner_category: PartnerCategory[];
  private _items_uuid: string[];
  private _admin_tax: number;
  private _marketing_tax: number;
  private _use_marketing: boolean
  private _market_place_tax?: number;
  private _use_market_place: boolean;
  private _created_at?: string;
  private _updated_at?: string;

  constructor(props: PartnerConfigProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._business_info_uuid = props.business_info_uuid;
    this._main_branch = props.main_branch;
    this._partner_category = props.partner_category;
    this._items_uuid = props.items_uuid;
    this._admin_tax = props.admin_tax;
    this._marketing_tax = props.marketing_tax;
    this._use_marketing = props.use_marketing ?? false
    this._market_place_tax = props.market_place_tax
    this._use_market_place = props.use_market_place ?? false
    this._created_at = newDateF(new Date());
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  // Getters para acesso às propriedades privadas
  get uuid(): Uuid | undefined {
    return this._uuid;
  }

  get business_info_uuid(): Uuid {
    return this._business_info_uuid;
  }

  get main_branch(): Uuid {
    return this._main_branch
  }

  get partner_category(): PartnerCategory[] {
    return this._partner_category;
  }

  get items_uuid(): string[] {
    return this._items_uuid;
  }

  get admin_tax(): number {
    return this._admin_tax;
  }

  get marketing_tax(): number {
    return this._marketing_tax;
  }

  get use_marketing(): boolean {
    return this._use_marketing
  }

  get market_place_tax(): number {
    return this._market_place_tax;
  }

  get use_market_place(): boolean {
    return this._use_market_place
  }
  get created_at(): string | undefined {
    return this._created_at;
  }

  get updated_at(): string | undefined {
    return this._updated_at;
  }

  changeAdminTax(admin_tax: number) {
    this._admin_tax = admin_tax
    this.validate()
  }

  changeMarketingTax(marketing_tax: number) {
    this._marketing_tax = marketing_tax
    this.validate()
  }

  changeMarketingPlaceTax(market_place_tax: number) {
    this._market_place_tax = market_place_tax
    this.validate()
  }

  enableMarketing(){
    this._use_marketing = true
  }

  disableMarketing(){
    this._use_marketing = false
  }

  enableMarketPlace(){
    this._use_market_place = true
  }

  disabelMarketPlace(){
    this._use_market_place = false
  }

  changeItemsUuid(items_uuid: string[]){
    this._items_uuid = items_uuid
    this.validate()
  }

  // Método de validação
  validate() {
    if (!this._business_info_uuid) {
      throw new CustomError('Business Info UUID is required', 400);
    }
    if (!Array.isArray(this._partner_category)) {
      throw new CustomError('partner_category must be an array', 400);
    }

    if (!this._partner_category || this._partner_category.length === 0) {
      throw new CustomError('At least one partner category is required', 400);
    }
    if(!this.main_branch) throw new CustomError("Branch uuid is required", 400)

    const validCategories = ['saude', 'cultura', 'comercio'];
    this._partner_category.forEach((category) => {
      if (!validCategories.includes(category)) {
        throw new CustomError(`Invalid partner category: ${category}`, 400);
      }
    });

    if (!this._items_uuid || !Array.isArray(this._items_uuid) || this._items_uuid.length === 0) {
      throw new CustomError('Items UUID is required and must be a non-empty array', 400);
    }
    if (this._admin_tax < 0) {
      throw new CustomError('Admin tax must be a positive number', 400);
    }
    if (this._marketing_tax < 0) {
      throw new CustomError('Marketing tax must be a positive number', 400);
    }

    if(this._use_market_place === undefined) throw new CustomError("Market place boolean is required", 400)

  }

  // Método estático para criação
  static create(data: PartnerConfigProps) {
    return new PartnerConfigEntity(data);
  }
}

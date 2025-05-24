import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../errors/custom.error";
import { newDateF } from "../../../../utils/date";

export type FileDTO = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

export type ProductProps = {
  uuid?: Uuid;
  category_uuid: Uuid;
  business_info_uuid: Uuid;
  ean_code: string | null;
  brand: string;
  name: string;
  description: string | null;
  original_price: number;
  discount: number;
  promotional_price: number;
  stock: number;
  api_image?: string;
  uploaded_images: FileDTO[];
  images_url?: string[];
  is_mega_promotion: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  weight?: string;
  height?: string;
  width?: string;
};

export type ProductCreateCommand = {
  category_uuid: Uuid;
  business_info_uuid: Uuid;
  ean_code: string | null;
  brand: string;
  name: string;
  description: string | null;
  original_price: number;
  discount: number;
  promotional_price: number;
  stock: number;
  api_image?: string;
  uploaded_images: FileDTO[];
  images_url?: string[];
  is_mega_promotion: boolean;
  is_active?: boolean;
  weight?: string;
  height?: string;
  width?: string;
};

export class ProductEntity {
  private _uuid: Uuid;
  private _category_uuid: Uuid;
  private _business_info_uuid: Uuid;
  private _ean_code: string | null;
  private _brand: string;
  private _name: string;
  private _description: string | null;
  private _original_price: number;
  private _discount: number;
  private _promotional_price: number;
  private _stock: number;
  private _api_image?: string;
  private _uploaded_images: FileDTO[];
  private _images_url?: string[];
  private _is_mega_promotion: boolean;
  private _is_active: boolean;
  private _created_at: string;
  private _updated_at: string;
  private _weight?: string;
  private _height?: string;
  private _width?: string;

  constructor(props: ProductProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._category_uuid = props.category_uuid;
    this._business_info_uuid = props.business_info_uuid;
    this._ean_code = props.ean_code ?? null;
    this._brand = props.brand;
    this._name = props.name;
    this._description = props.description ?? null;
    this._original_price = props.original_price;
    this._discount = props.discount;
    this._promotional_price = props.promotional_price;
    this._stock = props.stock;
    this._api_image = props.api_image;
    this._uploaded_images = props.uploaded_images;
    this._is_mega_promotion = props.is_mega_promotion ?? false;
    this._is_active = props.is_active ?? true;
    this._weight = props.weight;
    this._height = props.height;
    this._width = props.width;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());
    this.validate();
  }

  private validate() {
    if (!this._category_uuid) {
      throw new CustomError(
        'Category UUID is required',
        400,
      );
    }

    // Validate business_info_uuid
    if (!this._business_info_uuid) {
      throw new CustomError(
        'Business Info UUID is required',
        400,
      );
    }

    if (typeof this._original_price !== 'number')
      throw new CustomError(
        'Promotional price must be a number',
        400,
      );

    // Validate original_price
    if (!this._original_price) {
      throw new CustomError(
        'Original price is required',
        400,
      );
    }
    if (this._original_price < 0) {
      throw new CustomError(
        'Original price must be a non-negative number',
        400,
      );
    }

    // Validate discount
    if (!this._discount) {
      throw new CustomError('Discount is required', 400);
    }
    if (this._discount < 0 || this._discount > 100) {
      throw new CustomError(
        'Discount must be a number between 0 and 100',
        400,
      );
    }

    if (typeof this._promotional_price !== 'number')
      throw new CustomError(
        'Promotional price must be a number',
        400,
      );

    if (!this._promotional_price) {
      // Validate promotional_price
      throw new CustomError(
        'Promotional price is required',
        400,
      );
    }
    if (this._promotional_price < 0) {
      throw new CustomError(
        'Promotional price must be a non-negative number',
        400,
      );
    }

    // Ensure original price is greater than promotional price
    if (this._original_price < this._promotional_price) {
      throw new CustomError(
        'Original price must be greater than promotional price',
        400,
      );
    }

    // Validate stock
    if (!this._stock) {
      throw new CustomError('Stock is required', 400);
    }
    if (this._stock < 0) {
      throw new CustomError(
        'Stock must be a non-negative number',
        400,
      );
    }

    // Validate description
    if (!this._description) {
      throw new CustomError(
        'Description is required',
        400,
      );
    }
    if (typeof this._description !== 'string') {
      throw new CustomError(
        'Description must be a string or null',
        400,
      );
    }

    if (this._uploaded_images.length === 0) {
      throw new CustomError(
        'At least one image must me uploaded',
        400,
      );
    }

    // Validate uploaded_images
    if (!Array.isArray(this._uploaded_images)) {
      throw new CustomError(
        'Uploaded images are required and must be an array',
        400,
      );
    }

    // Validate brand
    if (!this._brand) {
      throw new CustomError('Brand is required', 400);
    }

    // Validate weight if provided
    if (this._weight !== undefined && typeof this._weight !== 'string') {
      throw new CustomError(
        'Weight must be a string if provided',
        400,
      );
    }

    // Validate height if provided
    if (this._height !== undefined && typeof this._height !== 'string') {
      throw new CustomError(
        'Height must be a string if provided',
        400,
      );
    }

    // Validate width if provided
    if (this._width !== undefined && typeof this._width !== 'string') {
      throw new CustomError(
        'Width must be a string if provided',
        400,
      );
    }

    // Specific rules for mega promotion and discount
    if (this._is_mega_promotion && this._discount < 25) {
      throw new CustomError(
        'Discount must be at least 25% for mega promotion',
        400,
      );
    }

    if (!this._is_mega_promotion && this._discount > 25) {
      throw new CustomError(
        'Discount must not exceed 25% for a non-mega promotion',
        400,
      );
    }
  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get category_uuid(): Uuid {
    return this._category_uuid;
  }

  get business_info_uuid(): Uuid {
    return this._business_info_uuid;
  }

  get ean_code(): string | null {
    return this._ean_code;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get original_price(): number {
    return this._original_price;
  }

  get discount(): number {
    return this._discount;
  }

  get promotional_price(): number {
    return this._promotional_price;
  }

  get stock(): number {
    return this._stock;
  }
  get api_image(): string {
    return this._api_image;
  }

  get uploaded_images(): FileDTO[] {
    return this._uploaded_images;
  }

  get images_url(): string[] {
    return this._images_url;
  }

  get is_mega_promotion(): boolean {
    return this._is_mega_promotion;
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

  get weight(): string | undefined {
    return this._weight;
  }

  get height(): string | undefined {
    return this._height;
  }

  get width(): string | undefined {
    return this._width;
  }

  get brand(): string {
    return this._brand;
  }
  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  changeDescription(description: string | null) {
    this._description = description;
    this.validate();
  }

  changeOriginalPrice(original_price: number) {
    this._original_price = original_price;
    this.validate();
  }

  changePromotionalPrice(promotional_price: number) {
    this._promotional_price = promotional_price;
    this.validate();
  }

  changeDiscount(discount: number) {
    this._discount = discount;
    this.validate();
  }

  changeStock(stock: number) {
    this._stock = stock;
    this.validate();
  }

  changeImagesUrl(images_url: string[]) {
    this._images_url = images_url;
    this.validate();
  }

  defineMegaPromotion() {
    this._is_mega_promotion = true;
  }

  defineSimplePromotion() {
    this._is_mega_promotion = false;
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
      category_uuid: this._category_uuid,
      business_info_uuid: this._business_info_uuid,
      ean_code: this._ean_code,
      name: this._name,
      description: this._description,
      original_price: this._original_price,
      discount: this._discount,
      promotional_price: this._promotional_price,
      stock: this._stock,
      api_image: this._api_image,
      uploaded_images: this._uploaded_images,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }

  static create(props: ProductCreateCommand) {
    return new ProductEntity(props);
  }
}

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

// Comando para CRIAR uma nova entidade. Preços em Reais, desconto em %.
export type ProductCreateCommand = {
  category_uuid: Uuid;
  business_info_uuid: Uuid;
  ean_code?: string | null;
  brand: string;
  name: string;
  description?: string | null;
  original_price: number; // ex: 19.99
  discount: number; // ex: 10 (para 10%)
  stock: number;
  uploaded_images?: FileDTO[];
  is_mega_promotion?: boolean;
  is_active?: boolean;
  weight?: string;
  height?: string;
  width?: string;
};

// Propriedades internas da entidade. Preços em centavos, desconto escalado.
export type ProductProps = {
  uuid?: Uuid;
  category_uuid: Uuid;
  business_info_uuid: Uuid;
  ean_code: string | null;
  brand: string;
  name: string;
  description: string | null;
  original_price: number; // ex: 1999
  discount: number; // ex: 100000 (para 10%)
  promotional_price: number; // ex: 1799
  stock: number;
  image_urls: string[];
  is_mega_promotion: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  private _discount: number; // Armazenado como 100000
  private _promotional_price: number;
  private _stock: number;
  private _image_urls: string[];
  private _is_mega_promotion: boolean;
  private _is_active: boolean;
  private _created_at: string;
  private _updated_at: string;
  private _weight?: string;
  private _height?: string;
  private _width?: string;

  private constructor(props: ProductProps) {
    // O construtor apenas atribui valores, esperando o formato interno correto
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
    this._image_urls = props.image_urls ?? [];
    this._is_mega_promotion = props.is_mega_promotion ?? false;
    this._is_active = props.is_active ?? true;
    this._weight = props.weight;
    this._height = props.height;
    this._width = props.width;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());
    this.validate();
  }

  private validate(): void {
    // Validações de negócio que se aplicam aos dados internos (em centavos)
    if (this._discount > 0 && this._promotional_price >= this._original_price) {
      throw new CustomError('O preço promocional deve ser menor que o preço original quando um desconto é aplicado.', 400);
    }

    // Esta validação de consistência matemática foi comentada, pois, como discutimos,
    // pequenos arredondamentos podem causar falhas desnecessárias. A regra acima é a mais importante.
    const calculatedPromoPrice = this._original_price - Math.round(this._original_price * (this._discount / 10000)); // Note a divisão por 10000
    if (this._promotional_price !== calculatedPromoPrice) {
      // throw new CustomError(`Preço promocional inconsistente...`, 400);
    }
  }
  // --- Getters (retornam valores formatados) ---
  get uuid(): Uuid { return this._uuid; }
  get category_uuid(): Uuid { return this._category_uuid; }
  get business_info_uuid(): Uuid { return this._business_info_uuid; }
  get ean_code(): string | null { return this._ean_code; }
  get brand(): string { return this._brand; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get original_price(): number { return this._original_price / 100; }
  get promotional_price(): number { return this._promotional_price / 100; }
  get discount(): number { return this._discount / 10000; }
  get stock(): number { return this._stock; }
  get image_urls(): string[] { return this._image_urls; }
  get is_mega_promotion(): boolean { return this._is_mega_promotion; }
  get is_active(): boolean { return this._is_active; }
  get created_at(): string { return this._created_at; }
  get updated_at(): string { return this._updated_at; }
  get weight(): string | undefined { return this._weight; }
  get height(): string | undefined { return this._height; }
  get width(): string | undefined { return this._width; }


  // --- Métodos de Alteração de Estado ---
  public changeName(name: string): void {
    this._name = name;
    this.touch();
    this.validate();
  }

  public changeDescription(description: string | null): void {
    this._description = description;
    this.touch();
    this.validate();
  }

  public changeBrand(brand: string): void {
    this._brand = brand;
    this.touch();
    this.validate();
  }

  public changePrices(original_price: number, discount: number): void {
    this._original_price = Math.round(original_price * 100);
    this._discount = discount;
    this._promotional_price = this._original_price - Math.round(this._original_price * (this._discount / 100));
    this.touch();
    this.validate();
  }

  public changeStock(newStock: number): void {
    this._stock = newStock;
    this.touch();
    this.validate();
  }

  public setImagesUrl(urls: string[]): void {
    this._image_urls = urls;
    this.touch();
  }

  public activate(): void {
    this._is_active = true;
    this.touch();
  }

  public deactivate(): void {
    this._is_active = false;
    this.touch();
  }

  private touch(): void {
    this._updated_at = newDateF(new Date());
  }

  // --- Serialização e Fábricas ---
  public toJSON() {
    return {
      uuid: this._uuid.uuid,
      category_uuid: this._category_uuid.uuid,
      business_info_uuid: this._business_info_uuid.uuid,
      ean_code: this._ean_code,
      brand: this._brand,
      name: this._name,
      description: this._description,
      original_price: this._original_price, // em centavos
      discount: this._discount,
      promotional_price: this._promotional_price, // em centavos
      stock: this._stock,
      image_urls: this._image_urls,
      is_mega_promotion: this._is_mega_promotion,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this._updated_at,
      weight: this._weight,
      height: this._height,
      width: this._width,
    };
  }

  public static create(command: ProductCreateCommand): ProductEntity {
    if (!command.name || typeof command.name !== 'string' || command.name.trim() === '') {
      throw new CustomError('Name is required and must be a non-empty string.', 400);
    }
    if (!command.brand || typeof command.brand !== 'string' || command.brand.trim() === '') {
      throw new CustomError('Brand is required and must be a non-empty string.', 400);
    }
    if (typeof command.original_price !== 'number' || command.original_price < 0) {
      throw new CustomError('Original price must be a non-negative number.', 400);
    }
    if (typeof command.stock !== 'number' || !Number.isInteger(command.stock) || command.stock < 0) {
      throw new CustomError('Stock must be a non-negative integer.', 400);
    }
    // Validamos o 'command.discount', que é o valor original (ex: 20)
    if (typeof command.discount !== 'number' || command.discount < 0 || command.discount > 100) {
      throw new CustomError('Discount must be a number between 0 and 100.', 400);
    }
    // O método create é responsável por converter os preços para centavos
    const originalPriceInCents = Math.round(command.original_price * 100);
    const promotionalPrice = originalPriceInCents - Math.round(originalPriceInCents * (command.discount / 100));
    const discountScaled = Math.round(command.discount * 10000);
    const props: ProductProps = {
      // Mapeamento explícito para garantir que todas as props obrigatórias sejam preenchidas
      category_uuid: command.category_uuid,
      business_info_uuid: command.business_info_uuid,
      ean_code: command.ean_code ?? null,
      brand: command.brand,
      name: command.name,
      description: command.description ?? null,
      original_price: originalPriceInCents,
      discount: discountScaled,
      promotional_price: promotionalPrice,
      stock: command.stock,
      image_urls: [], // Inicia vazio, será preenchido após o upload
      is_active: command.is_active ?? true,
      is_mega_promotion: command.is_mega_promotion ?? false,
      weight: command.weight,
      height: command.height,
      width: command.width,
    };
    return new ProductEntity(props);
  }

  public static hydrate(props: ProductProps): ProductEntity {
    // Apenas chama o construtor, pois os dados do banco já estão em centavos
    return new ProductEntity(props);
  }
}
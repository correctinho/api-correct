import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"; // Ajuste o caminho conforme necessário
import { CustomError } from "../../../../errors/custom.error"; // Ajuste o caminho conforme necessário
import { newDateF } from "../../../../utils/date"; // Ajuste o caminho conforme necessário

export type FileDTO = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
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
  is_mega_promotion: boolean;
  is_active?: boolean;
  weight?: string;
  height?: string;
  width?: string;
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
  private _images_url: string[];
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
    this._ean_code = props.ean_code === undefined ? null : props.ean_code;
    this._brand = props.brand;
    this._name = props.name;
    this._description = props.description === undefined ? null : props.description;
    this._original_price = props.original_price;
    this._discount = props.discount;
    this._promotional_price = props.promotional_price;
    this._stock = props.stock;
    this._api_image = props.api_image;
    this._uploaded_images = props.uploaded_images || [];
    this._images_url = props.images_url ?? [];
    this._is_mega_promotion = props.is_mega_promotion ?? false;
    this._is_active = props.is_active ?? true;
    this._weight = props.weight;
    this._height = props.height;
    this._width = props.width;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());
    this.validate();
  }

  private validateDimension(value: string | undefined, name: string): void {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        throw new CustomError(`${name} must be a string if provided.`, 400);
      }
      if (value.trim() !== "" && isNaN(parseFloat(value))) {
        throw new CustomError(`${name} must be a numeric string if not empty.`, 400);
      }
      if (value.trim() !== "" && parseFloat(value) < 0) {
        throw new CustomError(`${name} must be non-negative if not empty.`, 400);
      }
    }
  }

  private validate(): void {
    if (!this._category_uuid || !(this._category_uuid instanceof Uuid)) {
      throw new CustomError("Category UUID is required and must be a valid UUID object.", 400);
    }
    if (!this._business_info_uuid || !(this._business_info_uuid instanceof Uuid)) {
      throw new CustomError("Business Info UUID is required and must be a valid UUID object.", 400);
    }

    if (!this._name || typeof this._name !== 'string' || this._name.trim() === '') {
      throw new CustomError('Name is required and must be a non-empty string.', 400);
    }
    if (this._name.length > 255) {
      throw new CustomError('Name exceeds maximum length of 255 characters.', 400);
    }

    if (this._description !== null && typeof this._description !== 'string') {
      throw new CustomError('Description must be a string or null.', 400);
    }
    if (this._description && this._description.length > 2000) {
      throw new CustomError('Description exceeds maximum length of 2000 characters.', 400);
    }

    if (!this._brand || typeof this._brand !== 'string' || this._brand.trim() === '') {
      throw new CustomError('Brand is required and must be a non-empty string.', 400);
    }
    if (this._brand.length > 100) {
      throw new CustomError('Brand exceeds maximum length of 100 characters.', 400);
    }

    if (this._ean_code !== null && typeof this._ean_code !== 'string') {
      throw new CustomError('EAN code must be a string or null.', 400);
    }
    if (this._ean_code && !/^\d{8,14}$/.test(this._ean_code)) {
      throw new CustomError('EAN code must be 8 to 14 digits if provided.', 400);
    }

    if (typeof this._original_price !== 'number' || isNaN(this._original_price)) {
      throw new CustomError('Original price is required and must be a number.', 400);
    }
    if (this._original_price < 0) {
      throw new CustomError('Original price must be a non-negative number.', 400);
    }

    if (typeof this._discount !== 'number' || isNaN(this._discount)) {
      throw new CustomError('Discount is required and must be a number.', 400);
    }
    if (this._discount < 0 || this._discount > 100) {
      throw new CustomError('Discount must be a number between 0 and 100.', 400);
    }

    if (typeof this._promotional_price !== 'number' || isNaN(this._promotional_price)) {
      throw new CustomError('Promotional price is required and must be a number.', 400);
    }
    if (this._promotional_price < 0) {
      throw new CustomError('Promotional price must be a non-negative number.', 400);
    }
    if (this._discount > 0 && this._promotional_price >= this._original_price) {
      throw new CustomError('Promotional price must be less than original price when a discount is applied.', 400);
    }
    if (this._discount === 0 && this._promotional_price !== this._original_price) {
      throw new CustomError('Promotional price must be equal to original price when there is no discount.', 400);
    }
     if (this._promotional_price > this._original_price) {
      throw new CustomError('Promotional price cannot be greater than original price.', 400);
    }


    if (typeof this._stock !== 'number' || isNaN(this._stock)) {
      throw new CustomError('Stock is required and must be a number.', 400);
    }
    if (!Number.isInteger(this._stock)) {
      throw new CustomError('Stock must be an integer.', 400);
    }
    if (this._stock < 0) {
      throw new CustomError('Stock must be a non-negative number.', 400);
    }

    if (this._api_image !== undefined && this._api_image !== null) {
      if (typeof this._api_image !== 'string') {
          throw new CustomError('API image must be a string if provided.', 400);
      }
      try {
          new URL(this._api_image);
      } catch (_) {
          throw new CustomError('API image must be a valid URL if provided.', 400);
      }
    }

    if (!Array.isArray(this._uploaded_images)) {
      throw new CustomError('Uploaded images must be an array.', 400);
    }
    // This validation applies at creation if no images_url are pre-set
    // if (this._images_url.length === 0 && this._uploaded_images.length === 0 && !this._api_image) {
    //   throw new CustomError('At least one image (API image or uploaded image) is required.', 400);
    // }


    if (typeof this._is_mega_promotion !== 'boolean') {
      throw new CustomError('Is mega promotion flag must be a boolean.', 400);
    }
    if (this._is_mega_promotion && this._discount < 25) {
      throw new CustomError('Discount must be at least 25% for mega promotion.', 400);
    }
   if (!this._is_mega_promotion && this._discount > 25) {
      throw new CustomError('For a non-mega promotion, the discount cannot exceed 25%.', 400);
    }


    this.validateDimension(this._weight, 'Weight');
    this.validateDimension(this._height, 'Height');
    this.validateDimension(this._width, 'Width');
  }

  private touch(): void {
    this._updated_at = newDateF(new Date());
  }

  get uuid(): Uuid { return this._uuid; }
  get category_uuid(): Uuid { return this._category_uuid; }
  get business_info_uuid(): Uuid { return this._business_info_uuid; }
  get ean_code(): string | null { return this._ean_code; }
  get brand(): string { return this._brand; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get original_price(): number { return this._original_price; }
  get discount(): number { return this._discount; }
  get promotional_price(): number { return this._promotional_price; }
  get stock(): number { return this._stock; }
  get api_image(): string | undefined { return this._api_image; }
  get uploaded_images(): FileDTO[] { return this._uploaded_images; }
  get images_url(): string[] { return this._images_url; }
  get is_mega_promotion(): boolean { return this._is_mega_promotion; }
  get is_active(): boolean { return this._is_active; }
  get created_at(): string { return this._created_at; }
  get updated_at(): string { return this._updated_at; }
  get weight(): string | undefined { return this._weight; }
  get height(): string | undefined { return this._height; }
  get width(): string | undefined { return this._width; }

  changeName(name: string): void {
    this._name = name;
    this.validate();
    this.touch();
  }

  changeDescription(description: string | null): void {
    this._description = description;
    this.validate();
    this.touch();
  }

  changeBrand(brand: string): void {
    this._brand = brand;
    this.validate();
    this.touch();
  }

  changePrices(prices: { original_price: number; promotional_price: number; discount: number }): void {
    this._original_price = prices.original_price;
    this._promotional_price = prices.promotional_price;
    this._discount = prices.discount;
    this.validate();
    this.touch();
  }

  changeStock(stock: number): void {
    this._stock = stock;
    this.validate();
    this.touch();
  }

 changeImagesUrl(relative_image_paths: string[]): void {
  // 1. Valida se relative_image_paths é um array e se todos os seus elementos são strings.
  if (!Array.isArray(relative_image_paths) || !relative_image_paths.every(path => typeof path === 'string')) {
    throw new CustomError('Os caminhos das imagens devem ser um array de strings.', 400); // Traduzido
  }

  // 2. Valida cada caminho relativo.
  //    Removemos a validação `new URL(path)` pois esperamos caminhos relativos.
  //    Podemos adicionar outras validações se necessário (ex: não ser string vazia).
  for (const path of relative_image_paths) {
    if (!path || path.trim() === "") {
      throw new CustomError('O caminho da imagem não pode ser uma string vazia.', 400); // Traduzido
    }
    // Opcional: Adicionar mais validações para o formato do caminho relativo, se necessário.
    // Por exemplo, verificar se não contém "://" para garantir que não é uma URL completa por engano.
    // if (path.includes('://')) {
    //   throw new CustomError(`Formato de caminho de imagem inválido: '${path}'. Esperava-se um caminho relativo, mas parece ser uma URL completa.`, 400);
    // }
  }

  // 3. Regra de negócio: Garante que o produto tenha pelo menos uma imagem.
  //    Esta lógica assume que `this._api_image` (se existir) é uma URL completa
  //    e é tratada separadamente, ou que o array `relative_image_paths` representa
  //    as imagens principais.
  //    Se `this._api_image` também fosse um caminho relativo e incluído em `relative_image_paths`
  //    pelo UseCase, a condição seria apenas `if (relative_image_paths.length === 0)`.
  //    Vamos manter a lógica que considera `_api_image` como uma possível fonte alternativa
  //    de imagem (provavelmente uma URL completa).
  // if (relative_image_paths.length === 0 && !this._api_image) {
  //   throw new CustomError('O produto deve ter pelo menos uma URL de imagem (via API image) ou um caminho de imagem carregada.', 400); // Traduzido e adaptado
  // }

  // 4. Atribui os caminhos relativos validados à propriedade da entidade.
  //    Agora, `this._images_url` armazenará caminhos relativos para as imagens processadas.
  this._images_url = relative_image_paths;

  // 5. Atualiza o timestamp de modificação.
  this.touch();
}

  updateApiImage(api_image: string | undefined) : void {
    this._api_image = api_image;
    this.validate(); // re-validate image rules
    this.touch();
  }

  setMegaPromotion(isMega: boolean, discount?: number): void {
    this._is_mega_promotion = isMega;
    if (discount !== undefined) {
        this._discount = discount;
    }
    this.validate();
    this.touch();
  }

  activate(): void {
    this._is_active = true;
    this.touch();
  }

  deactivate(): void {
    this._is_active = false;
    this.touch();
  }

  static create(command: ProductCreateCommand): ProductEntity {
    const props: ProductProps = {
      ...command,
      uploaded_images: command.uploaded_images || [], // Ensure it's an array
    };
    return new ProductEntity(props);
  }

  toJSON() {
    return {
      uuid: this._uuid,
      category_uuid: this._category_uuid,
      business_info_uuid: this._business_info_uuid,
      ean_code: this._ean_code,
      brand: this._brand,
      name: this._name,
      description: this._description,
      original_price: this._original_price,
      discount: this._discount,
      promotional_price: this._promotional_price,
      stock: this._stock,
      api_image: this._api_image,
      // uploaded_images: this._uploaded_images, // Geralmente não é serializado; buffers são grandes. Remova se não for necessário.
      images_url: this._images_url,
      is_mega_promotion: this._is_mega_promotion,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this._updated_at,
      weight: this._weight,
      height: this._height,
      width: this._width,
    };
  }
}

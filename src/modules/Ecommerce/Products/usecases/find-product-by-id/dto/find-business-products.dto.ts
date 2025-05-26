export type OutputFindProductDTO = {
  uuid: string,
  category_uuid: string,
  brand: string,
  name: string,
  description: string,
  original_price: number,
  discount: number,
  promotional_price: number,
  stock: number,
  is_mega_promotion: boolean,
  weight: string,
  height: string,
  width: string,
  created_at: string,
  updated_at: string | null,
  is_active: boolean,
  images_url: {
    thumbnail: string[],
    medium: string[],
    large: string[]
  }
};

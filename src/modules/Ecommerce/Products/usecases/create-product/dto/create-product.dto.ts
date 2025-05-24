export type InputCreateProductDTO = {
  category_uuid: string;
  business_user_uuid: string;
  business_info_uuid: string;
  ean_code: string | null;
  brand: string;
  name: string;
  description: string | null;
  original_price: number;
  discount: number;
  promotional_price: number;
  stock: number;
  api_image: string;
  is_mega_promotion: string;
  is_active: boolean;
  uploaded_images: FileDTO[];
  created_at: string;
  updated_at: string;
};

export type FileDTO = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

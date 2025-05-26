export type InputCreateProductDTO = {
  category_uuid: string;        // String UUID
  business_user_uuid: string;   // String UUID
  ean_code: string | null;
  brand: string | null | undefined;
  name: string;
  description: string | null;
  original_price: string;     // String, needs parsing to number (cents)
  promotional_price: string;  // String, needs parsing to number (cents)
  discount: string;           // String, needs parsing to number
  stock: string;              // String, needs parsing to number
  api_image?: string;
  uploaded_images: FileDTO[]; // Assumed to be correctly formed FileDTOs
  is_mega_promotion: string;  // String (e.g., "true", "false")
  is_active?: string;         // String (e.g., "true", "false"), optional
  weight?: string;
  height?: string;
  width?: string;
};

export type FileDTO = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

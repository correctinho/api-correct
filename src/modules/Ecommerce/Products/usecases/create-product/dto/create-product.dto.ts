import { ProductType } from "@prisma/client";


export type InputCreateProductDTO = {
  category_uuid: string;      // UUID da Categoria
  business_user_uuid: string; // UUID do usuário de negócio (virá do token)
  product_type: ProductType
  ean_code?: string | null;
  brand: string;
  name: string;
  description?: string | null;
  original_price: number;     // Ex: "19.99"
  discount: number;           // Ex: "10" (para 10%)
  stock: number;              // Ex: "100"
  is_mega_promotion?: boolean; // Ex: "true" ou "false"
  is_active?: boolean;         // Ex: "true" ou "false"
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

export type OutputCreateProductDTO = {
  uuid: string;
  name: string;
  description: string | null;
  original_price: number; // Em Reais (ex: 19.99)
  promotional_price: number; // Em Reais
  discount: number; // Em porcentagem (ex: 10)
  product_type: ProductType
  stock: number;
  images_url: string[]
  is_mega_promotion: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  weight?: string;
  height?: string;
  width?: string;
  brand: string | null;
  created_by_uuid: string;
};

export type InputUploadProductImagesDTO = {
  // O ID do produto virá do parâmetro da URL (ex: req.params.productId)
  productId: string;

  // Os arquivos de imagem virão do corpo da requisição (ex: req.files)
  files: FileDTO[];
};

export type OutputUploadProductImagesDTO = {
  productId: string;
  // Retorna a lista final e atualizada de URLs públicas das imagens do produto
  images_url: string[];
};

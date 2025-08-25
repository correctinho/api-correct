export type OutputFindOwnBusinessProductDTO = {
  uuid: string;
  name: string;
  description: string | null;
  original_price: number;
  promotional_price: number;
  stock: number;
  brand: string;
  is_active: boolean; // Importante para o parceiro ver o status
  images_url: {
    thumbnail: string[];
    medium: string[];
    large: string[];
  };
};

export type OutputFindPublicProductDTO = {
    uuid: string;
    category_uuid: string;
    brand: string;
    name: string;
    description: string | null;
    original_price: number; // Em Reais (ex: 19.99)
    discount: number; // Em porcentagem (ex: 10)
    promotional_price: number; // Em Reais
    stock: number;
    is_mega_promotion: boolean;
    main_image_url: string | null; // Apenas a URL da imagem principal (thumbnail ou medium)
};
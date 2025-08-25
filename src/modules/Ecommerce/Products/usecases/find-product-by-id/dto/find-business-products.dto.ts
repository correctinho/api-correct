export type OutputFindPublicProductDTO = {
    uuid: string;
    category_uuid: string;
    brand: string;
    name: string;
    description: string | null;
    original_price: number; // Em Reais (ex: 19.99)
    promotional_price: number; // Em Reais
    stock: number;
    is_mega_promotion: boolean;
    
    // Simplificado para o cliente: uma imagem principal e uma galeria
    main_image_url: string | null;
    gallery_image_urls: string[];

    weight?: string;
    height?: string;
    width?: string;
};
export type OutputFindProductDTO = {
    uuid: string;
    category_uuid: string;
    brand: string;
    name: string;
    description: string | null;
    original_price: number; // Em Reais
    discount: number; // Em porcentagem
    promotional_price: number; // Em Reais
    stock: number;
    is_mega_promotion: boolean;
    is_active: boolean; // Essencial para o gerenciamento
    created_at: string;
    updated_at: string | null;
    
    // Retorna todos os tamanhos de imagem para a tela de edição
    images_url: {
        medium: string[];
        large: string[];
    };

    weight?: string;
    height?: string;
    width?: string;
};

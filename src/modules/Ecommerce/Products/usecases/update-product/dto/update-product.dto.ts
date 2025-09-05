export type InputUpdateProductDTO = {
    productId: string;
    businessUserId: string;
    businessInfoId: string;
    data: {
        name?: string;
        description?: string | null;
        original_price?: number; // Em Reais
        discount?: number; // Em %
        stock?: number;
        brand?: string;
        is_active?: boolean;
        weight?: string;
        height?: string;
    };
};

export type OutputUpdateProductDTO = {
    uuid: string;
    name: string;
    description: string | null;
    original_price: number; // Em Reais
    discount: number
    promotional_price: number; // Em Reais
    stock: number;
    brand: string
    is_active: boolean;
    weight: string | null;
    height: string | null;
    updated_at: string;
    updated_by_uuid: string;
};
import { FileDTO } from "../../../entities/product.entity";


export type InputUploadProductImagesDTO = {
    // O ID do produto virá do parâmetro da URL (ex: req.params.productId)
    productId: string;

    // Os arquivos de imagem virão do corpo da requisição (ex: req.files)
    files: FileDTO[];

    // O UUID do usuário de negócio, para validação de permissão
    business_user_uuid: string;
};

export type OutputUploadProductImagesDTO = {
    productId: string;
    images_url: string[];
};
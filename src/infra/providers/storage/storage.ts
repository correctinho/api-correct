// ../../../../../infra/providers/storage/storage.ts
import { FileDTO } from "../../../modules/Ecommerce/Products/entities/products.entity";

export interface StorageUploadData {
  url: string;  // A URL pública completa para acessar o arquivo
  path: string; // O caminho relativo dentro do bucket, usado para gerenciamento (ex: delete)
}

export interface UploadResponse {
  data: StorageUploadData | null;
  error: Error | null | any;
}

export abstract class IStorage {
  abstract upload(file: FileDTO, folder: string): Promise<UploadResponse>;
  abstract delete(filePath: string): Promise<void>; // Continua usando o path relativo
}

// ../../../../../infra/providers/storage/storage.ts

import { MulterFile } from "../../shared/multer/multer-memory.config";

export interface StorageUploadData {
  url: string;  // A URL pública completa para acessar o arquivo
  path: string; // O caminho relativo dentro do bucket, usado para gerenciamento (ex: delete)
}

export interface UploadResponse {
  data: StorageUploadData | null;
  error: Error | null | any;
}

export abstract class IStorage {
  abstract upload(file: MulterFile, folder: string, isPrivate?: boolean): Promise<UploadResponse>;
  abstract delete(filePath: string, isPrivate?: boolean): Promise<void>; // Continua usando o path relativo
  abstract getPresignedUrl?(filePath: string): Promise<string>;
}

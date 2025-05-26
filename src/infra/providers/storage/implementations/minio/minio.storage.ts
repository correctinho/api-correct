// ../../../../../infra/providers/storage/implementations/minio/minio.storage.ts
import { Client as MinioClient } from 'minio';
import { FileDTO } from '../../../../../modules/Ecommerce/Products/entities/products.entity';
import { IStorage, UploadResponse, StorageUploadData } from '../../storage';

export class MinioStorage implements IStorage {
  private client: MinioClient;
  private bucketName: string;
  private endpoint: string;
  private port: number;
  private useSSL: boolean;
  private publicEndpoint?: string; // Opcional: se o endpoint público for diferente do de conexão

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT!;
    const portStr = process.env.MINIO_PORT!;
    const useSSLStr = process.env.MINIO_USE_SSL;
    const accessKey = process.env.MINIO_ACCESS_KEY!;
    const secretKey = process.env.MINIO_SECRET_KEY!;
    this.bucketName = process.env.MINIO_BUCKET_NAME ?? 'default-bucket';
    this.publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT; // Use se o endpoint de acesso público for diferente

    if (!this.endpoint || !accessKey || !secretKey || !portStr) {
      throw new Error(
        'MinIO credentials (ENDPOINT, PORT, ACCESS_KEY, SECRET_KEY) are not properly configured in environment variables.'
      );
    }

    this.port = parseInt(portStr, 10);
    if (isNaN(this.port)) {
      throw new Error('MINIO_PORT must be a valid number.');
    }
    this.useSSL = useSSLStr ? useSSLStr.toLowerCase() === 'true' : false;

    this.client = new MinioClient({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }

  private getPublicUrl(filePath: string): string {
    const scheme = this.useSSL ? 'https://' : 'http://';
    // Usar o publicEndpoint se definido, caso contrário, o endpoint de conexão
    const host = this.publicEndpoint || this.endpoint;

    // Omitir porta se for padrão (80 para http, 443 para https)
    let portString = '';
    if (!((this.useSSL && this.port === 443) || (!this.useSSL && this.port === 80))) {
      portString = `:${this.port}`;
    }
    // Se publicEndpoint já incluir a porta, não adicionar novamente (requer que publicEndpoint seja configurado corretamente)
    // Uma lógica mais simples é assumir que publicEndpoint não tem a porta se a porta de conexão não for padrão.
    if (this.publicEndpoint && this.publicEndpoint.includes(':')) { // se publicEndpoint já tem porta
      portString = ''; // não adiciona a porta da conexão
    }


    return `${scheme}${host}${portString}/${this.bucketName}/${filePath}`;
  }

  async upload(file: FileDTO, folder: string): Promise<UploadResponse> {
    const relativePath = folder ? `${folder}/${file.originalname}` : file.originalname;
    const metaData = {
      'Content-Type': file.mimetype,
    };

    try {
      const bucketExists = await this.client.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucketName, '');
        console.log(`Bucket ${this.bucketName} created successfully.`);
      }

      await this.client.putObject(
        this.bucketName,
        relativePath,
        file.buffer,
        file.buffer.length,
        metaData
      );

      const publicUrl = this.getPublicUrl(relativePath);

      return {
        data: {
          url: publicUrl,      // URL pública completa
          path: relativePath,  // Caminho relativo para gerenciamento
        },
        error: null,
      };
    } catch (error: any) {
      console.error('MinIO upload error:', error);
      return { data: null, error };
    }
  }

  async delete(filePath: string): Promise<void> { // filePath aqui é o path relativo
    try {
      await this.client.removeObject(this.bucketName, filePath);
    } catch (error: any) {
      console.error(`Error deleting object ${filePath} from MinIO:`, error);
      throw new Error(
        `Failed to delete image ${filePath} from MinIO: ${error.message}`
      );
    }
  }
}

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import https from 'https';
import dns from 'dns';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { IStorage, StorageUploadData, UploadResponse } from '../../storage';
import { MulterFile } from '../../../../shared/multer/multer-memory.config';

// Força resolução IPv4 prioritária para evitar falhas ENETUNREACH/ETIMEDOUT em conexões com Cloudflare
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignora se não suportado no ambiente
}

export class CloudflareR2Storage implements IStorage {
  private s3Client: S3Client;
  private publicBucket: string;
  private privateBucket: string;
  private publicDomain: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    
    this.publicBucket = process.env.R2_PUBLIC_BUCKET || 'correct-produtos';
    this.privateBucket = process.env.R2_PRIVATE_BUCKET || 'correct-documentos';
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || '';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn("R2 credentials not fully configured in environment variables.");
    }

    const agent = new https.Agent({
      keepAlive: true,
      maxSockets: 50,
      timeout: 60000,
    });

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      requestHandler: new NodeHttpHandler({
        httpsAgent: agent,
        connectionTimeout: 30000,
        requestTimeout: 60000,
      }),
    });
  }

  async upload(file: MulterFile, folder: string, isPrivate: boolean = false): Promise<UploadResponse> {
    try {
      // 1. Processar e otimizar a imagem com Sharp (Apenas se for imagem)
      let fileBuffer = file.buffer;
      let mimeType = file.mimetype;
      let extension = file.originalname.split('.').pop() || 'bin';

      if (mimeType.startsWith('image/')) {
        fileBuffer = await sharp(file.buffer)
          .rotate() // Auto-orienta baseado no EXIF da câmera
          .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        mimeType = 'image/webp';
        extension = 'webp';
      }

      // 2. Definir nome único e caminho
      const fileName = file.originalname || `${uuidv4()}.${extension}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      const bucketName = isPrivate ? this.privateBucket : this.publicBucket;

      // 3. Upload para o R2 com retentativa
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      let attempts = 0;
      while (true) {
        try {
          attempts++;
          await this.s3Client.send(command);
          break;
        } catch (uploadErr) {
          if (attempts >= 2) throw uploadErr;
          console.warn(`[CloudflareR2Storage] Tentativa ${attempts} de upload para ${filePath} falhou, tentando novamente...`);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      // 4. Retornar os dados
      const url = isPrivate ? filePath : `${this.publicDomain}/${filePath}`;

      return {
        data: {
          url: url,
          path: filePath,
        },
        error: null,
      };
    } catch (error) {
      console.error("[CloudflareR2Storage] Upload error:", error);
      return {
        data: null,
        error,
      };
    }
  }

  async delete(filePath: string, isPrivate: boolean = false): Promise<void> {
    try {
      const bucketName = isPrivate ? this.privateBucket : this.publicBucket;
      
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("[CloudflareR2Storage] Delete error:", error);
      throw error;
    }
  }

  async getPresignedUrl(filePath: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.privateBucket,
        Key: filePath,
      });
      
      // Gera uma URL que expira em 15 minutos (900 segundos)
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      return url;
    } catch (error) {
      console.error("[CloudflareR2Storage] getPresignedUrl error:", error);
      throw error;
    }
  }
}

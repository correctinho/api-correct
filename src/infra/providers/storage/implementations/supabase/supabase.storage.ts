// ../../../../../infra/providers/storage/implementations/supabase/supabase.storage.ts
import { FileDTO } from '../../../../../modules/Ecommerce/Products/entities/products.entity';
import { IStorage, UploadResponse, StorageUploadData } from '../../storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorage implements IStorage {
  private client: SupabaseClient;
  private bucketName: string;
  // Adicione uma propriedade para a URL pública do Supabase, se necessário, ou construa dinamicamente
  // private supabasePublicUrl: string; // Ex: process.env.SUPABASE_PUBLIC_URL

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.bucketName = process.env.SUPABASE_BUCKET ?? 'default-bucket';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL ou Key não configuradas nas variáveis de ambiente.');
    }
    this.client = createClient(supabaseUrl, supabaseKey);
    // this.supabasePublicUrl = process.env.SUPABASE_PUBLIC_URL || supabaseUrl; // Ajuste conforme necessário
  }

  async upload(file: FileDTO, folder: string): Promise<UploadResponse> {
    const relativePath = `${file.originalname}`; // Caminho relativo no bucket
    const { data: uploadData, error: uploadError } = await this.client.storage
      .from(this.bucketName)
      .upload(relativePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { data: null, error: uploadError };
    }

    if (!uploadData || !uploadData.path) {
      const err = new Error('Upload para o Supabase bem-sucedido, mas o path não foi retornado.');
      console.error(err);
      return { data: null, error: err };
    }

    // Obter a URL pública
    const { data: publicUrlData } = this.client.storage
      .from(this.bucketName)
      .getPublicUrl(relativePath); // Usa o relativePath retornado pelo uploadData.path ou o que você montou

    if (!publicUrlData || !publicUrlData.publicUrl) {
        const err = new Error('Não foi possível obter a URL pública do Supabase para o arquivo: ' + relativePath);
        console.error(err);
        // Você pode optar por retornar um erro ou tentar construir manualmente se tiver um padrão
        // Por segurança, retornamos erro aqui.
        return { data: null, error: err };
    }

    return {
      data: {
        url: publicUrlData.publicUrl, // URL pública completa
        path: relativePath,           // Caminho relativo para gerenciamento
      },
      error: null,
    };
  }

  async delete(filePath: string): Promise<void> { // filePath aqui é o path relativo
    const { error } = await this.client.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao excluir imagem do Supabase:', error);
      throw new Error(`Falha ao excluir imagem ${filePath} no Supabase: ${error.message}`);
    }
  }
}

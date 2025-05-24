import { FileDTO } from '../../../modules/Ecommerce/Products/entities/products.entity';
import { IStorage } from './storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorage implements IStorage {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_KEY ?? '',
    );
  }
  async upload(file: FileDTO, folder: string): Promise<any> {
    const data = await this.client.storage
      .from(process.env.SUPABASE_BUCKET ?? '')
      .upload(`${folder}/` + file.originalname, file.buffer, {
        upsert: true,
      });

    return data;
  }

  // Função para excluir um arquivo do Supabase
  async delete(filePath: string): Promise<void> {
    const { error } = await this.client.storage
      .from(process.env.SUPABASE_BUCKET ?? '')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao excluir imagem do Supabase:', error);
      throw new Error('Falha ao excluir imagem no Supabase');
    }
  }
}

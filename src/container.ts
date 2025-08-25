import { IStorage } from './infra/providers/storage/storage';
import { SupabaseStorage } from './infra/providers/storage/implementations/supabase/supabase.storage';
// Importe outras classes de serviço que você queira gerenciar aqui

/**
 * Classe que gerencia a criação e o fornecimento de instâncias de serviços (dependências).
 * Segue um padrão Singleton para garantir uma única fonte da verdade.
 */
class AppContainer {
    public storage: IStorage;

    constructor() {
        // Em um ambiente normal (não-teste), ele cria a instância real.
        this.storage = new SupabaseStorage();
    }

    /**
     * Este método permite que nossos testes substituam a implementação
     * real por uma versão "mockada".
     */
    setStorage(storageImplementation: IStorage): void {
        this.storage = storageImplementation;
    }
}

// Exportamos uma única instância do contêiner para ser usada em toda a aplicação.
export const container = new AppContainer();

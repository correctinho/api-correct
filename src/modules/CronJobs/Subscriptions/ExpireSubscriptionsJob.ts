import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { ICronJob } from "../../../infra/cron/ICronJob";
import { IAppUserItemRepository } from "../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ISubscriptionRepository } from "../../Payments/SubscriptionsPlans/repositories/subscription.repository";


export class ExpireSubscriptionsJob implements ICronJob {
  name = 'ExpireSubscriptionsJob';
  // Roda todo dia às 03:00 da manhã.
  schedule = '0 3 * * *'; 
  // Sugestão para testes: '*/5 * * * *' (a cada 5 minutos)

  constructor(
    private readonly subscriptionsRepository: ISubscriptionRepository,
    private readonly userItemRepository: IAppUserItemRepository
  ) {}

  async execute(): Promise<void> {
    console.log(`[${this.name}] ⏰ Iniciando verificação de assinaturas vencidas...`);
    const now = new Date();

    // ==================================================================
    // 1. LEITURA: Usando o método especializado do repositório
    // ==================================================================
    // Retorna Entidades de Domínio, não objetos puros do banco.
    const expiredEntities = await this.subscriptionsRepository.findExpiredActiveSubscriptions(now);

    if (expiredEntities.length === 0) {
      console.log(`[${this.name}] ✅ Nenhuma assinatura vencida encontrada.`);
      return;
    }

    console.log(`[${this.name}] Encontradas ${expiredEntities.length} assinaturas para expirar.`);

    // ==================================================================
    // 2. PROCESSAMENTO: Preparando os IDs para atualização em massa
    // ==================================================================
    
    // Extrai os UUIDs (Value Objects) das assinaturas
    const subUuidsToExpire: Uuid[] = expiredEntities.map(entity => entity.uuid);

    // Extrai os UUIDs dos itens de usuário, filtrando os nulos
    const userItemUuidsToBlock: Uuid[] = expiredEntities
        .map(entity => entity.user_item_uuid)
        .filter(uuid => uuid !== null) as Uuid[];


    // ==================================================================
    // 3. ESCRITA: Usando os novos métodos de "Bulk Update" dos repositórios
    // ==================================================================
    // Nota: Perdemos a atomicidade da transação única aqui ao chamar dois repositórios separados.
    // Para um cron job simples, isso geralmente é aceitável. Se a atomicidade for crucial,
    // precisaríamos usar o padrão Unit of Work aqui também.
    
    console.log(`[${this.name}] Atualizando status das assinaturas para EXPIRED...`);
    // Use o seu Enum de domínio se tiver, ex: SubscriptionStatusEnum.EXPIRED
    await this.subscriptionsRepository.updateStatusBulk(subUuidsToExpire, 'EXPIRED');

    if (userItemUuidsToBlock.length > 0) {
        console.log(`[${this.name}] Bloqueando ${userItemUuidsToBlock.length} itens de usuário associados...`);
        // Use o seu Enum de domínio se tiver, ex: UserItemStatusEnum.BLOCKED
        await this.userItemRepository.updateStatusBulk(userItemUuidsToBlock, 'blocked');
    }

    console.log(`[${this.name}] ✅ Processamento concluído com sucesso.`);
  }
}
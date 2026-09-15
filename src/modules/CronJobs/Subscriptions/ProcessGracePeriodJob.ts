import { Uuid } from "../../../@shared/ValueObjects/uuid.vo";
import { ICronJob } from "../../../infra/cron/ICronJob";
import { IAppUserItemRepository } from "../../AppUser/AppUserManagement/repositories/app-user-item-repository";

export class ProcessGracePeriodJob implements ICronJob {
  name = 'ProcessGracePeriodJob';
  // Roda todo dia às 04:00 da manhã.
  schedule = '0 4 * * *'; 

  constructor(
    private readonly userItemRepository: IAppUserItemRepository
  ) {}

  async execute(): Promise<void> {
    console.log(`[${this.name}] ⏰ Iniciando verificação de cancelamentos agendados (Fim de Ciclo)...`);
    const now = new Date();

    // 1. Busca os UserItems que devem ser cancelados hoje
    const expiredEntities = await this.userItemRepository.findItemsWithExpiredGracePeriod(now);

    if (expiredEntities.length === 0) {
      console.log(`[${this.name}] ✅ Nenhum cancelamento pendente encontrado.`);
      return;
    }

    console.log(`[${this.name}] Encontrados ${expiredEntities.length} itens para cancelar definitivamente.`);

    // 2. Extrai os UUIDs
    const userItemUuidsToCancel: Uuid[] = expiredEntities.map(entity => entity.uuid);

    // 3. Atualiza o status em lote para CANCELLED
    console.log(`[${this.name}] Alterando status dos itens para CANCELLED...`);
    
    // NOTA: Idealmente devemos também preencher a coluna 'cancelled_at'.
    // Mas para manter a simplicidade da API de repositório, vamos usar o updateStatusBulk.
    await this.userItemRepository.updateStatusBulk(userItemUuidsToCancel, 'cancelled');

    console.log(`[${this.name}] ✅ Processamento concluído com sucesso.`);
  }
}

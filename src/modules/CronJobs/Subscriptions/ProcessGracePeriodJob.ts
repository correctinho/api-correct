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
    console.log(`[${this.name}] ⏰ Iniciando verificação de cancelamentos agendados (saldo zerado)...`);
    const now = new Date();

    // 1. Busca os UserItems em to_be_cancelled com saldo esgotado (balance <= 0)
    const expiredEntities = await this.userItemRepository.findItemsWithExpiredGracePeriod(now);

    if (expiredEntities.length === 0) {
      console.log(`[${this.name}] ✅ Nenhum cancelamento elegível encontrado (itens com saldo permanecem ativos para consumo).`);
      return;
    }

    console.log(`[${this.name}] Encontrados ${expiredEntities.length} itens com saldo esgotado para cancelar definitivamente.`);

    // 2. Extrai os UUIDs
    const userItemUuidsToCancel: Uuid[] = expiredEntities.map(entity => entity.uuid);

    // 3. Atualiza o status em lote para CANCELLED preenchendo cancelled_at
    console.log(`[${this.name}] Alterando status dos itens para CANCELLED...`);
    await this.userItemRepository.updateStatusBulk(userItemUuidsToCancel, 'cancelled');

    console.log(`[${this.name}] ✅ Processamento concluído com sucesso.`);
  }
}

import { OfflineTokenHistoryEventType, OfflineTokenStatus } from '@prisma/client';
import {
  InputActivateTokensOffline,
  OutputActivateTokensOffline
} from './dto/activate-tokens-offline.dto';
import { IAppUserItemRepository } from '../../../../AppUser/AppUserManagement/repositories/app-user-item-repository';
import { IOfflineTokenRepository } from '../../repositories/offline-tokens.repository';
import { IOfflineTokenHistoryRepository } from '../../repositories/offline-tokens-history.repository';
import { CustomError } from '../../../../../errors/custom.error';
import { OfflineTokenHistoryEntity } from '../../entities/offline-tokens-history.entity';
import { OfflineTokenEntity } from '../../entities/offline-token.entity';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo'; // Certifique-se de que Uuid está importado corretamente

export class ActivateTokensOfflineUsecase {
  private static readonly OFFLINE_TOKEN_MAX_COUNT = 5;
  private static readonly OFFLINE_TOKEN_TTL_DAYS = 30; // 30 dias de validade

  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private offlineTokenRepository: IOfflineTokenRepository,
    private offlineTokenHistoryRepository: IOfflineTokenHistoryRepository,
  ) {}

  async execute(input: InputActivateTokensOffline): Promise<OutputActivateTokensOffline> {
    const { userInfoUuid, userItemUuid } = input;

    // 1. Validar se o UserItem existe e pertence ao usuário
    const userItem = await this.appUserItemRepository.find(userItemUuid);

    if (!userItem || !userItem.user_info_uuid.equals(userInfoUuid)) {
      throw new CustomError("UserItem not found or does not belong to the user.", 404);
    }

    // NOVA LÓGICA: Revogar tokens ativos de OUTROS UserItems do MESMO usuário
    await this.revokeOtherUserItemTokens(userInfoUuid, userItemUuid);

    // 2. Deletar todos os tokens existentes para ESTE UserItem (e registrar no histórico)
    const existingTokensForCurrentItem = await this.offlineTokenRepository.findByUserItem(userInfoUuid, userItemUuid);
    for (const token of existingTokensForCurrentItem) {
      // Cria um registro de histórico para a substituição do token atual
      await this.offlineTokenHistoryRepository.create(
        OfflineTokenHistoryEntity.create({
          original_token_uuid: token.uuid,
          token_code: token.token_code,
          user_info_uuid: userInfoUuid,
          user_item_uuid: userItemUuid,
          event_type: OfflineTokenHistoryEventType.REPLACED_BY_NEW_ACTIVATION,
          event_description: `Token for current UserItem replaced by new activation. Original Status: ${token.status}`,
          snapshot_expires_at: token.expires_at,
          snapshot_status: token.status,
        })
      );
      // Deleta o token da tabela principal
      await this.offlineTokenRepository.delete(token.uuid);
    }

    // 3. Gerar e criar 5 novos OfflineTokens para o UserItem ATUAL
    const newOfflineTokensEntities: OfflineTokenEntity[] = [];
    for (let i = 1; i <= ActivateTokensOfflineUsecase.OFFLINE_TOKEN_MAX_COUNT; i++) {
      let tokenCode: string;
      let isUnique = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      do {
        tokenCode = this.generateUniqueTokenCode();
        isUnique = !(await this.offlineTokenRepository.existsByTokenCode(tokenCode));
        attempts++;
        if (attempts >= MAX_ATTEMPTS && !isUnique) {
          throw new CustomError("Failed to generate a unique token code after multiple attempts.", 500);
        }
      } while (!isUnique);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ActivateTokensOfflineUsecase.OFFLINE_TOKEN_TTL_DAYS);

      const newEntity = OfflineTokenEntity.create({
        token_code: tokenCode,
        user_info_uuid: userInfoUuid,
        user_item_uuid: userItemUuid,
        expires_at: expiresAt,
        sequence_number: i,
      });
      newOfflineTokensEntities.push(newEntity);
    }

    // Persistir os novos tokens em batch
    const createdTokens = await this.offlineTokenRepository.createMany(newOfflineTokensEntities);

    // 4. Registrar a criação dos novos tokens no histórico
    for (const token of createdTokens) {
      await this.offlineTokenHistoryRepository.create(
        OfflineTokenHistoryEntity.create({
          original_token_uuid: token.uuid,
          token_code: token.token_code,
          user_info_uuid: userInfoUuid,
          user_item_uuid: userItemUuid,
          event_type: OfflineTokenHistoryEventType.ACTIVATED,
          event_description: `New offline token activated with sequence ${token.sequence_number}`,
          snapshot_expires_at: token.expires_at,
          snapshot_status: token.status,
        })
      );
    }

    // 5. Retornar os tokens criados (propriedades) no formato Output DTO
    return {
      offlineTokens: createdTokens.map(token => token.toJSON())
    };
  }

  // --- Funções Auxiliares Privadas ---

  /**
   * Gera um código alfanumérico de 6 caracteres.
   * @returns O código do token gerado.
   */
  private generateUniqueTokenCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Revoga tokens ativos associados a UserItems DIFERENTES do UserItem atual
   * para o mesmo usuário. Isso é útil ao mudar o benefício do token offline.
   * @param userInfoUuid O UUID do usuário.
   * @param currentUserItemUuid O UUID do UserItem que está sendo ativado.
   */
  private async revokeOtherUserItemTokens(userInfoUuid: Uuid, currentUserItemUuid: Uuid): Promise<void> {
    // Buscar TODOS os tokens ATIVOS do usuário (sem filtro de UserItem)
    const allActiveTokensForUser = await this.offlineTokenRepository.findByUserItem(userInfoUuid, undefined, OfflineTokenStatus.ACTIVE);

    for (const token of allActiveTokensForUser) {
      // Se o token pertence a um UserItem DIFERENTE do que está sendo ativado
      if (!token.user_item_uuid.equals(currentUserItemUuid)) {
        // Marca o token como REVOKED
        token.markAsRevoked();

        // Atualiza o token no repositório
        await this.offlineTokenRepository.update(token);

        // Registra o evento de revogação no histórico
        await this.offlineTokenHistoryRepository.create(
          OfflineTokenHistoryEntity.create({
            original_token_uuid: token.uuid,
            token_code: token.token_code,
            user_info_uuid: userInfoUuid,
            user_item_uuid: token.user_item_uuid, // Usa o UserItem original do token
            event_type: OfflineTokenHistoryEventType.REVOKED,
            event_description: `Token for UserItem ${token.user_item_uuid.uuid} revoked due to activation of another UserItem ${currentUserItemUuid.uuid}.`,
            snapshot_expires_at: token.expires_at,
            snapshot_status: OfflineTokenStatus.ACTIVE, // Snapshot do status ANTES da revogação
          })
        );
      }
    }
  }
}
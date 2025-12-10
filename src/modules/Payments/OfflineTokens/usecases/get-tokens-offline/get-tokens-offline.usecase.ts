import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IOfflineTokenRepository } from "../../repositories/offline-tokens.repository";
import { OfflineTokenEntity } from '../../entities/offline-token.entity';
import { OfflineTokenStatus, OfflineTokenHistoryEventType } from '@prisma/client';
import { IOfflineTokenHistoryRepository } from "../../repositories/offline-tokens-history.repository";
import { OfflineTokenHistoryEntity } from '../../entities/offline-tokens-history.entity';

import { InputGetTokensOffline, OutputGetTokensOffline } from './dto/get-tokens-offline.dto';
import { all } from "axios";

export class GetTokensOfflineUsecase {
  private static readonly OFFLINE_TOKEN_MAX_COUNT = 5;
  private static readonly OFFLINE_TOKEN_TTL_DAYS = 30;

  constructor(
    private offlineTokenRepository: IOfflineTokenRepository,
    private offlineTokenHistoryRepository: IOfflineTokenHistoryRepository
  ) {}

  async execute(data: InputGetTokensOffline): Promise<OutputGetTokensOffline> {
    const { userInfoUuid } = data;
    const now = new Date();
    // 1. Buscar TODOS os tokens do usuário (independente do status)
    const allUserTokens = await this.offlineTokenRepository.findAllByUserInfo(userInfoUuid);
    const activeItemUuid = this.findActiveUserItemUuid(allUserTokens);
    if (!activeItemUuid) {
      // Usuário nunca ativou tokens.
      return { offlineTokens: [] };
    }
    // B. Limpeza (Deleção de tokens expirados ou consumidos)
    const tokensToDelete = allUserTokens.filter(token =>
      token.user_item_uuid.equals(activeItemUuid) &&
      (token.status === OfflineTokenStatus.CONSUMED || token.expires_at <= now)
    );

    for (const token of tokensToDelete) {
      const eventType = token.status === OfflineTokenStatus.CONSUMED 
                        ? OfflineTokenHistoryEventType.DELETED_FROM_POOL // (ou CONSUMED_AND_DELETED)
                        : OfflineTokenHistoryEventType.EXPIRED_BY_TTL;
      const description = `Token ${token.status} cleaned up by GetTokensUsecase.`;

      // Chama o novo método atômico do repositório
      await this.offlineTokenRepository.archiveAndDelete(token, eventType, description);
    }

    // C. Buscar tokens ATIVOS restantes (após a limpeza)
    const existingActiveTokens = allUserTokens.filter(token =>
      token.user_item_uuid.equals(activeItemUuid) &&
      token.status === OfflineTokenStatus.ACTIVE &&
      token.expires_at > now // Filtra os que acabamos de limpar (embora já tenham sido deletados)
    );

    // 2. Calcular quantos tokens precisam ser gerados
    const tokensToGenerateCount = GetTokensOfflineUsecase.OFFLINE_TOKEN_MAX_COUNT - existingActiveTokens.length;

    let newTokens: OfflineTokenEntity[] = [];

    // 3. Gerar novos tokens se a pool estiver incompleta
    if (tokensToGenerateCount > 0) {
      const newOfflineTokensEntities: OfflineTokenEntity[] = [];
      const currentSequence = existingActiveTokens.length;

      for (let i = 1; i <= tokensToGenerateCount; i++) {
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
        expiresAt.setDate(expiresAt.getDate() + GetTokensOfflineUsecase.OFFLINE_TOKEN_TTL_DAYS);

        const newEntity = OfflineTokenEntity.create({
          token_code: tokenCode,
          user_info_uuid: userInfoUuid,
          user_item_uuid: activeItemUuid,
          expires_at: expiresAt,
          sequence_number: currentSequence + i,
        });
        newOfflineTokensEntities.push(newEntity);
      }
      newTokens = await this.offlineTokenRepository.createMany(newOfflineTokensEntities);

      // Registrar histórico de ativação (reabastecimento)
      for (const token of newTokens) {
        await this.offlineTokenHistoryRepository.create(
          OfflineTokenHistoryEntity.create({
            original_token_uuid: token.uuid,
            token_code: token.token_code,
            user_info_uuid: userInfoUuid,
            user_item_uuid: activeItemUuid,
            event_type: OfflineTokenHistoryEventType.ACTIVATED,
            event_description: `New token (re-fill) activated with sequence ${token.sequence_number}`,
            snapshot_expires_at: token.expires_at,
            snapshot_status: token.status,
          })
        );
      }
    }

    const allActiveTokens = [...existingActiveTokens, ...newTokens];
    return {
      offlineTokens: allActiveTokens.map(token => token.toJSON())
    };
  }

  // Método auxiliar para encontrar o UserItem ativo (baseado na regra de um único benefício)
  private findActiveUserItemUuid(allTokens: OfflineTokenEntity[]): Uuid | null {
    const now = new Date();

    // 1. Prioridade máxima: Tentar encontrar um token que esteja "vivo" (ATIVO e não expirado).
    // Isso é o cenário ideal.
    const activeNonExpiredToken = allTokens.find(
      (t) => t.status === OfflineTokenStatus.ACTIVE && t.expires_at > now
    );

    if (activeNonExpiredToken) {
      return activeNonExpiredToken.user_item_uuid;
    }

    // 2. Fallback: Se não achamos nenhum token "vivo", significa que todos os tokens
    // do usuário estão expirados, consumidos ou revogados.
    // Mas se a lista 'allTokens' não estiver vazia, significa que ele JÁ teve o benefício.
    // Precisamos apenas pegar o user_item_uuid do token mais recente para saber o que reabastecer.

    if (allTokens.length > 0) {
      // Ordena todos os tokens do mais recente para o mais antigo e pega o primeiro.
      // Não importa o status dele agora, só queremos o ID do item.
      const mostRecentToken = allTokens.sort(
        (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
      )[0];

      // Retorna o ID do item do token mais recente encontrado no histórico
      return mostRecentToken.user_item_uuid;
    }

    console.log("No token history found for user. User never activated.");
    // Se o array allTokens estiver vazio, o usuário realmente nunca ativou nada.
    return null;
  }

  private generateUniqueTokenCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
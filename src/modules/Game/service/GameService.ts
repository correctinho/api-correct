import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DTO: Data Transfer Object (Para tipar o que entra na função)
interface SubmitScoreDTO {
  gameSlug: string;
  score: number;
  metaData?: any;
  userId?: string;       // UUID do UserInfo
  businessId?: string;   // UUID do BusinessUser
}

export const GameService = {
  
  /**
   * Salva uma nova pontuação no banco de dados.
   * Lança erro se o jogo não existir ou se nenhum usuário for informado.
   */
  async submitScore({ gameSlug, score, metaData, userId, businessId }: SubmitScoreDTO) {
    
    const game = await prisma.game.findUnique({
      where: { slug: gameSlug },
    });

    if (!game) throw new Error(`Jogo '${gameSlug}' não encontrado.`);

    const dataToCreate: any = {
      score,
      metaData: metaData || {},
      game: { connect: { id: game.id } }
    };

    if (userId) {
      dataToCreate.userInfo = { connect: { uuid: userId } };
    } else if (businessId) {
      dataToCreate.businessUser = { connect: { uuid: businessId } };
    }

    // CREATE: Gera um histórico completo
    return await prisma.gameScore.create({
      data: dataToCreate
    });
  },
  /**
   * Busca o Ranking (Leaderboard) de um jogo específico.
   * Já trata a lógica de exibir GamerTag ou Nome Real.
   */
  async getLeaderboard(gameSlug: string, limit = 10) {
    // 1. Buscamos um "Buffer" maior (ex: 5x o limite).
    // Se queremos o Top 5, buscamos os 25 melhores registros gerais.
    // Isso garante que acharemos 5 pessoas diferentes mesmo que o 1º tenha jogado 10x.
    const bufferLimit = limit * 5; 

    const scores = await prisma.gameScore.findMany({
      where: {
        game: { slug: gameSlug }
      },
      take: bufferLimit, 
      orderBy: { score: 'desc' }, // O maior score sempre vem primeiro
      include: {
        userInfo: {
          select: { uuid: true, gamerTag: true }
        },
        businessUser: {
          select: { uuid: true, gamerTag: true }
        }
      }
    });

    // 2. Lógica de Filtragem (O Segredo)
    const uniquePlayers = new Set<string>();
    const ranking: any[] = [];

    for (const record of scores) {
      // Se já preenchemos o ranking desejado (ex: 5 posições), paramos.
      if (ranking.length >= limit) break;

      // Identifica o ID do jogador (Seja App ou Business)
      const playerId = record.userInfo?.uuid || record.businessUser?.uuid;

      // Se não tiver ID ou se esse ID JÁ ESTIVER na lista, IGNORA (pula para o próximo)
      if (!playerId || uniquePlayers.has(playerId)) {
        continue;
      }

      // Adiciona na lista de "Já processados"
      uniquePlayers.add(playerId);

      // 3. Formata o objeto para o frontend
      let displayName = 'Anônimo';
      let isBusiness = false;

      if (record.userInfo) {
        displayName = record.userInfo.gamerTag;
      } else if (record.businessUser) {
        displayName = record.businessUser.gamerTag;
        isBusiness = true;
      }

      ranking.push({
        rank: ranking.length + 1,
        score: record.score,
        playerName: displayName,
        isBusinessPlayer: isBusiness,
        playedAt: record.playedAt
      });
    }

    return ranking;
  },

  async getPlayerStats(gameSlug: string, userId?: string, businessId?: string) {
    if (!userId && !businessId) throw new Error("User ID required");

    // 1. Busca dados do Jogo
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
    if (!game) throw new Error("Game not found");

    // 2. Busca o Perfil (UserInfo ou BusinessUser)
    let profile;
    if (userId) {
      profile = await prisma.userInfo.findUnique({ 
        where: { uuid: userId },
        select: { gamerTag: true }
      });
    } else {
      profile = await prisma.businessUser.findUnique({ 
        where: { uuid: businessId },
        select: { gamerTag: true }
      });
    }

    // 3. Busca o Melhor Score Pessoal (High Score)
    const bestScoreRecord = await prisma.gameScore.findFirst({
      where: {
        gameId: game.id,
        OR: [
          { userInfoId: userId },
          { businessUserId: businessId }
        ]
      },
      orderBy: { score: 'desc' },
      select: { score: true }
    });

    return {
      gamerTag: profile?.gamerTag || null,
      highScore: bestScoreRecord?.score || 0
    };
  }
};
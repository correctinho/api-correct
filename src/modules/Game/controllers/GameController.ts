import { Request, Response } from 'express';
import { GameService } from '../service/GameService';

export const GameController = {
  
 async saveUserScore(req: Request, res: Response) {
    try {
      const { gameSlug, score, metaData } = req.body;
      console.log("Controller chamado")
      // O middleware authUser garante que req.user (ou req.userInfo) existe
      const userId = req.appUser.user_info_uuid; 
      console.log("Iniciando chamada do service submit score")
      const newScore = await GameService.submitScore({
        gameSlug,
        score: Number(score),
        metaData,
        userId: userId, // Manda o ID do cliente
        businessId: undefined // Garante que o business é nulo
      });

      return res.status(201).json(newScore);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // --- CENÁRIO 2: USUÁRIO BUSINESS ---
  async saveBusinessScore(req: Request, res: Response) {
    try {
      const { gameSlug, score, metaData } = req.body;

      // O middleware authBusiness garante que req.businessUser existe
      const businessId = req.companyUser.companyUserId 

      const newScore = await GameService.submitScore({
        gameSlug,
        score: Number(score),
        metaData,
        userId: undefined, // Garante que o user é nulo
        businessId: businessId // Manda o ID da empresa
      });

      return res.status(201).json(newScore);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // GET /api/games/:slug/ranking
  async getRanking(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { limit } = req.query; // Permite passar ?limit=50 na URL

      const ranking = await GameService.getLeaderboard(
        slug, 
        limit ? Number(limit) : 10
      );

      return res.json(ranking);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
  },

  async getMyStats(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      let userId: string | undefined = undefined;
      let businessId: string | undefined = undefined;
      
      if(req.appUser) userId = req.appUser.user_info_uuid;
      if(req.companyUser) businessId = req.companyUser.companyUserId;

      const stats = await GameService.getPlayerStats(slug, userId, businessId);
      return res.json(stats);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
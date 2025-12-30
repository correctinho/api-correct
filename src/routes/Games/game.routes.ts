import { Router } from 'express';
// Certifique-se que os caminhos dos middlewares estão corretos na sua estrutura
import { appUserIsAuth } from '../../infra/shared/middlewares/AppUser/app-user-auth.middleware';
import { companyIsAuth } from '../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware';
import { GameController } from '../../modules/Game/controllers/GameController';
import { ProfileController } from '../../modules/Game/controllers/ProfileController';

const gameRouter = Router();

// ==========================================
// 1. ROTA PÚBLICA (CONSISTENTE COM FRONTEND)
// ==========================================
// Frontend chama: /games/rock-dodger/ranking?limit=5
gameRouter.get(
  '/games/:slug/ranking', 
  GameController.getRanking
);

// ==========================================
// 2. ROTAS DO USUÁRIO APP (CONSISTENTE COM FRONTEND)
// ==========================================

// Frontend chama: /games/rock-dodger/me
gameRouter.get(
  '/games/:slug/me', 
  appUserIsAuth, 
  GameController.getMyStats
);

// Frontend chama: /games/score/user
gameRouter.post(
  '/games/score/user', 
  appUserIsAuth, 
  GameController.saveUserScore 
);

gameRouter.patch(
  '/profile/user/gamertag',
  appUserIsAuth,
  ProfileController.setUserTag 
);

// ==========================================
// 3. ROTAS PARA EMPRESAS (BUSINESS)
// ==========================================
gameRouter.post(
  '/score/business', 
  companyIsAuth, 
  GameController.saveBusinessScore 
);

// Se a empresa quiser ver os stats dela, ela chamará esta rota específica
gameRouter.get(
  '/business/:slug/me', 
  companyIsAuth, 
  GameController.getMyStats
);

export { gameRouter };
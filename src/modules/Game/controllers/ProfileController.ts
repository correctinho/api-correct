import { Request, Response } from 'express';
import { ProfileService } from '../service/ProfileService';

export const ProfileController = {

  // PATCH /api/profile/user/gamertag
  async setUserTag(req: Request, res: Response) {
    try {
      const { gamerTag } = req.body;
      const userId = req.appUser.user_info_uuid; 
      const updatedProfile = await ProfileService.updateUserGamerTag(userId, gamerTag);
      return res.json({
        success: true,
        message: 'Apelido de jogador atualizado!',
        data: updatedProfile
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // PATCH /api/profile/business/gamertag
  async setBusinessTag(req: Request, res: Response) {
    try {
      const { gamerTag } = req.body;
      const businessId = req.companyUser.companyUserId; // Vem do authBusinessMiddleware

      const updatedProfile = await ProfileService.updateBusinessGamerTag(businessId, gamerTag);

      return res.json({
        success: true,
        message: 'Apelido da empresa atualizado!',
        data: updatedProfile
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
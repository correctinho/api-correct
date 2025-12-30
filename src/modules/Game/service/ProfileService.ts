import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ProfileService = {
  
  // Atualiza Tag do Cliente (UserInfo)
  async updateUserGamerTag(userId: string, newTag: string) {
    // 1. Validações básicas
    if (newTag.length < 3 || newTag.length > 20) {
      throw new Error('O apelido deve ter entre 3 e 20 caracteres.');
    }

    // 2. Atualiza
    return await prisma.userInfo.update({
      where: { uuid: userId },
      data: { gamerTag: newTag },
      select: { uuid: true, gamerTag: true } // Retorna só o necessário
    });
  },

  // Atualiza Tag da Empresa (BusinessUser)
  async updateBusinessGamerTag(businessId: string, newTag: string) {
    if (newTag.length < 3 || newTag.length > 20) {
      throw new Error('O apelido deve ter entre 3 e 20 caracteres.');
    }

    return await prisma.businessUser.update({
      where: { uuid: businessId },
      data: { gamerTag: newTag },
      select: { uuid: true, name: true, gamerTag: true }
    });
  }
};
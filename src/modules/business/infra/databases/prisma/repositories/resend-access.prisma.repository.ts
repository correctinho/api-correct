import { prismaClient } from '../../../../../../infra/databases/prisma.config';
import { IResendAccessRepository } from '../../../../domain/repositories/resend-access.repository.interface';
import { ResendAccessRepoInputDto, ResendAccessRepoOutputDto } from '../../../../application/usecases/dto/resend-access.dto';

export class ResendAccessPrismaRepository implements IResendAccessRepository {
  async resendAccess(data: ResendAccessRepoInputDto): Promise<ResendAccessRepoOutputDto> {
    const user = await prismaClient.businessUser.findFirst({
      where: {
        business_info_uuid: data.uuid,
        is_admin: true,
      }
    });

    if (!user) {
      throw new Error('Usuário administrador não encontrado para esta empresa.');
    }

    const updatedUser = await prismaClient.businessUser.update({
      where: { uuid: user.uuid },
      data: {
        password: data.new_password_hash,
        status: 'pending_password',
      }
    });

    return {
      success: true,
      message: 'Acesso reenviado com sucesso.',
      admin_email: updatedUser.email || '',
      name: updatedUser.name || '',
    };
  }
}

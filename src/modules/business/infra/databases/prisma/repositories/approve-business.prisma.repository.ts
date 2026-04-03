import { prismaClient } from '../../../../../../infra/databases/prisma.config';
import { IApproveBusinessRepository } from '../../../../domain/repositories/approve-business.repository.interface';
import { ApproveBusinessRepoInputDto, ApproveBusinessOutputDto } from '../../../../application/usecases/dto/approve-business.dto';

export class ApproveBusinessPrismaRepository implements IApproveBusinessRepository {
  async approve(data: ApproveBusinessRepoInputDto): Promise<ApproveBusinessOutputDto> {
    return prismaClient.$transaction(async (tx) => {
      const business = await tx.businessInfo.findUnique({
        where: { uuid: data.uuid }
      });

      if (!business) {
        throw new Error('Empresa não encontrada.');
      }

      if (business.status !== 'pending_approval') {
        throw new Error('A empresa não está com status pendente de aprovação.');
      }

      await tx.businessInfo.update({
        where: { uuid: data.uuid },
        data: {
          status: 'active',
          approved_at: new Date().toISOString(),
        }
      });

      await tx.businessUser.create({
        data: {
          business_info_uuid: data.uuid,
          email: data.admin_email,
          name: business.fantasy_name,
          password: data.password_hash,
          is_admin: true,
          status: 'pending_password',
        }
      });

      return {
        success: true,
        message: 'Empresa aprovada e usuário administrador criado com sucesso.'
      };
    });
  }
}

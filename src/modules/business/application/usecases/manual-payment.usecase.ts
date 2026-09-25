import { prismaClient } from '../../../../infra/databases/prisma.config';
import { CustomError } from '../../../../errors/custom.error';

export class ManualPaymentUsecase {
  async execute(business_info_uuid: string) {
    const business = await prismaClient.businessInfo.findUnique({
      where: { uuid: business_info_uuid }
    });

    if (!business) {
      throw new CustomError('Empresa não encontrada.', 404);
    }

    if (business.status !== 'awaiting_payment') {
      throw new CustomError('Empresa não está aguardando pagamento.', 400);
    }

    const updatedBusiness = await prismaClient.businessInfo.update({
      where: { uuid: business_info_uuid },
      data: { status: 'pending_approval' }
    });

    return updatedBusiness;
  }
}

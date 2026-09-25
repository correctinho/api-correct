import { prismaClient } from "../../../../infra/databases/prisma.config";
import { BusinessContractPrismaRepository } from "../../../Terms/repositories/implementations/prisma-business-contract.repository";
import { CustomError } from '../../../../errors/custom.error';

export class MarkContractSignedUsecase {
  async execute(business_info_uuid: string) {
    const business = await prismaClient.businessInfo.findUnique({
      where: { uuid: business_info_uuid }
    });

    if (!business) {
      throw new CustomError('Empresa não encontrada.', 404);
    }

    const repository = new BusinessContractPrismaRepository();

    // Procura o contrato
    let contract = await repository.findByBusinessId(business_info_uuid);

    if (contract) {
      // Atualiza
      await repository.updateStatus(business_info_uuid, 'SIGNED');
      contract = await repository.findByBusinessId(business_info_uuid);
    } else {
      // Como ainda não temos o fluxo 100% de gerar o contrato,
      // criamos um placeholder como SIGNED
      const terms = await prismaClient.termsOfService.findFirst({
        orderBy: { version: 'desc' }
      });
      if (!terms) {
        throw new CustomError('Termos de serviço não encontrados no sistema.', 404);
      }

      contract = await prismaClient.businessContract.create({
        data: {
          business_info_uuid,
          terms_uuid: terms.uuid,
          rendered_html: '<p>Contrato assinado manualmente via Admin</p>',
          status: 'SIGNED',
          signed_at: new Date()
        }
      });
    }

    await prismaClient.businessInfo.update({
      where: { uuid: business_info_uuid },
      data: { status: 'awaiting_payment' }
    });

    return contract;
  }
}

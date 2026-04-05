import { prismaClient } from '../../../../../../infra/databases/prisma.config';
import { IGetEmployerDetailsRepository } from '../../../../domain/repositories/get-employer-details.repository.interface';
import { CustomError } from '../../../../../../errors/custom.error';

export class GetEmployerDetailsPrismaRepository implements IGetEmployerDetailsRepository {
  async findEmployerDetails(uuid: string): Promise<any> {
    const employer = await prismaClient.businessInfo.findUnique({
      where: { uuid },
      include: {
        Address: true,
        EmployerItemDetails: {
          include: {
            Item: true,
            BenefitGroups: true,
          }
        }
      }
    });

    if (!employer) {
      throw new CustomError('Employer not found.', 404);
    }

    if (!['empregador', 'empregador_comercio'].includes(employer.business_type)) {
      throw new CustomError('Business is not an employer.', 404);
    }

    return employer;
  }
}

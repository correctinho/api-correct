import { IGetEmployerDetailsRepository } from '../../domain/repositories/get-employer-details.repository.interface';
import { GetEmployerDetailsOutputDto } from './dto/get-employer-details.dto';
import { CustomError } from '../../../../errors/custom.error';

class OutputMapper {
  static toOutput(employerDB: any): GetEmployerDetailsOutputDto {
    const address = employerDB.Address ? {
      uuid: employerDB.Address.uuid,
      line1: employerDB.Address.line1,
      line2: employerDB.Address.line2,
      line3: employerDB.Address.line3,
      postal_code: employerDB.Address.postal_code,
      neighborhood: employerDB.Address.neighborhood,
      city: employerDB.Address.city,
      state: employerDB.Address.state,
      country: employerDB.Address.country,
    } : null;

    const benefits = (employerDB.EmployerItemDetails || []).map((detail: any) => {
      let reference_value = 0;
      if (detail.BenefitGroups && detail.BenefitGroups.length > 0) {
        const defaultGroup = detail.BenefitGroups.find((g: any) => g.is_default);
        reference_value = defaultGroup ? defaultGroup.value / 100 : detail.BenefitGroups[0].value / 100;
      }

      return {
        uuid: detail.uuid,
        item_uuid: detail.item_uuid,
        name: detail.Item?.name || '',
        category: detail.Item?.item_category || '',
        cycle_end_day: detail.cycle_end_day || null,
        reference_value,
      };
    });

    return {
      uuid: employerDB.uuid,
      fantasy_name: employerDB.fantasy_name,
      document: employerDB.document,
      email: employerDB.email,
      phone_1: employerDB.phone_1,
      phone_2: employerDB.phone_2,
      payroll_closing_day: employerDB.payroll_closing_day,
      txt_delivery_day: employerDB.txt_delivery_day,
      colaborators_number: employerDB.colaborators_number,
      classification: employerDB.classification,
      status: employerDB.status,
      address,
      benefits,
    };
  }
}

export class GetEmployerDetailsUsecase {
  constructor(private readonly getEmployerDetailsRepository: IGetEmployerDetailsRepository) { }

  async execute(uuid?: string): Promise<GetEmployerDetailsOutputDto> {
    if (!uuid) {
      throw new CustomError('UUID is required.', 400);
    }

    const result = await this.getEmployerDetailsRepository.findEmployerDetails(uuid);

    return OutputMapper.toOutput(result);
  }
}

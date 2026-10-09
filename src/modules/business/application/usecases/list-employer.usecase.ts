import { IListEmployerRepository } from '../../domain/repositories/list-employer.repository.interface';
import { ListEmployerInputDto, ListEmployerOutputDto, EmployerEntity } from './dto/list-employer.dto';

class OutputMapper {
  static toOutput(data: any): ListEmployerOutputDto {
    const mappedData: EmployerEntity[] = data.data.map((item: any) => ({
      uuid: item.uuid,
      company_name: item.company_name,
      fantasy_name: item.company_name, // fallback for old frontends
      document: item.document,
      email: item.email,
      phone_1: item.phone_1,
      status: item.status,
      created_at: item.created_at,
    }));

    return {
      data: mappedData,
      meta: data.meta,
    };
  }
}

export class ListEmployerUsecase {
  constructor(
    private readonly listEmployerRepository: IListEmployerRepository
  ) {}

  async execute(input: ListEmployerInputDto): Promise<ListEmployerOutputDto> {
    const page = input.page && input.page > 0 ? Number(input.page) : 1;
    const limit = input.limit && input.limit > 0 ? Number(input.limit) : 10;

    const result = await this.listEmployerRepository.findAllEmployers({
      ...input,
      page,
      limit,
    });

    return OutputMapper.toOutput(result);
  }
}

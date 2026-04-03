import { IListPartnerRepository } from '../../domain/repositories/list-partner.repository.interface';
import { ListPartnerInputDto, ListPartnerOutputDto } from './dto/list-partner.dto';

export class ListPartnerUsecase {
  constructor(
    private readonly listPartnerRepository: IListPartnerRepository
  ) {}

  async execute(input: ListPartnerInputDto): Promise<ListPartnerOutputDto> {
    const page = input.page && input.page > 0 ? Number(input.page) : 1;
    const limit = input.limit && input.limit > 0 ? Number(input.limit) : 10;

    return this.listPartnerRepository.list({
      ...input,
      page,
      limit,
    });
  }
}

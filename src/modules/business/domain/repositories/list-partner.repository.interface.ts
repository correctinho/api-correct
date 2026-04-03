import { ListPartnerInputDto, ListPartnerOutputDto } from '../../application/usecases/dto/list-partner.dto';

export interface IListPartnerRepository {
  list(input: ListPartnerInputDto): Promise<ListPartnerOutputDto>;
}

import { ListEmployerInputDto, ListEmployerOutputDto } from '../../application/usecases/dto/list-employer.dto';

export interface IListEmployerRepository {
  findAllEmployers(input: ListEmployerInputDto): Promise<ListEmployerOutputDto>;
}

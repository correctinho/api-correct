import { GetBusinessDetailInputDto, GetBusinessDetailOutputDto } from '../../application/usecases/dto/get-business-detail.dto';

export interface IGetBusinessDetailRepository {
  findById(input: GetBusinessDetailInputDto): Promise<GetBusinessDetailOutputDto | null>;
  findItemsNamesByUuids(uuids: string[]): Promise<string[]>;
}

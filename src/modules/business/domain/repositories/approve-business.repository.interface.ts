import { ApproveBusinessRepoInputDto, ApproveBusinessOutputDto } from '../../application/usecases/dto/approve-business.dto';

export interface IApproveBusinessRepository {
  approve(input: ApproveBusinessRepoInputDto): Promise<ApproveBusinessOutputDto>;
}

import { ResendAccessRepoInputDto, ResendAccessRepoOutputDto } from '../../application/usecases/dto/resend-access.dto';

export interface IResendAccessRepository {
  resendAccess(input: ResendAccessRepoInputDto): Promise<ResendAccessRepoOutputDto>;
}

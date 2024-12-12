import { CorrectAdminEntity } from "../entities/correct-admin.entity";
import RepositoryInterface from "../../../@shared/domain/repository/repository-interface";
import { OutputFindAdminAuthDTO, OutputFindAdminDTO } from "../correct-dto/correct.dto";

export interface ICorrectAdminRepository extends RepositoryInterface<OutputFindAdminDTO | null>{
    findByUserName(userName: string): Promise<OutputFindAdminDTO | null>
    findByUserNameAuth(userName: string): Promise<CorrectAdminEntity | null>

}

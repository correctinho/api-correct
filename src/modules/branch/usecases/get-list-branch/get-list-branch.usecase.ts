import { IBranchRepository } from '../../repositories/branch.repository';
import { OutputGetListBranch } from './dto/get-list-branch.dto';

export class GetListBranchUsecase {
    constructor(private branchRepository: IBranchRepository) { }

    async execute():Promise<OutputGetListBranch[]> {
        const branch = await this.branchRepository.list();
        return branch.map(item => ({
            uuid: item.uuid,
            name: item.name,
            marketing_tax: item.marketing_tax / 10000,
            admin_tax: item.admin_tax / 10000,
            market_place_tax: item.market_place_tax  / 10000,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }));
    }
}

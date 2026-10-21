import { IBranchRepository } from '../../repositories/branch.repository';
import { OutputGetListBranch } from './dto/get-list-branch.dto';

export class GetListBranchUsecase {
    constructor(private branchRepository: IBranchRepository) { }

    async execute():Promise<OutputGetListBranch[]> {
        const branch = await this.branchRepository.list();
        return branch.map(item => ({
            uuid: item.uuid,
            name: item.name,
            marketing_tax: item.marketing_tax,
            admin_tax: item.admin_tax,
            market_place_tax: item.market_place_tax,
            created_at: item.created_at,
            updated_at: item.updated_at,
            items: item.items,
        }));
    }
}

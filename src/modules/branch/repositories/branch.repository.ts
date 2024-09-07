import { BranchEntity } from '../entities/branch.entity';

export interface IBranchRepository {
    create(data: BranchEntity): Promise<BranchEntity>;
    getByID(uuid: string): Promise<BranchEntity | null>;
    update(uuid: string, data: BranchEntity): Promise<void>;
    list(): Promise<BranchEntity[] | []>;
    findByName(branch_name: string): Promise<BranchEntity | null>
    createMany(data: BranchEntity[]):Promise<BranchEntity[]>
    // delete(uuid: string): Promise<void>;
}

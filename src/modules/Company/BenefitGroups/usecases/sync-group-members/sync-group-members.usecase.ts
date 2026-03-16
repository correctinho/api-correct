import { CustomError } from "../../../../../errors/custom.error";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { InputSyncGroupMembersDTO } from "./dto/sync-group-members.dto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export class SyncGroupMembersUsecase {
    constructor(
        private benefitGroupsRepository: IBenefitGroupsRepository,
        private businessItemDetailsRepository: IBusinessItemDetailsRepository
    ) {}

    async execute(business_info_uuid: string, data: InputSyncGroupMembersDTO): Promise<void> {
        if (!business_info_uuid) throw new CustomError("Business ID is required", 400);
        if (!data.benefit_group_uuid) throw new CustomError("Group ID is required", 400);
        
        const employeesList = Array.isArray(data.employee_uuids) ? data.employee_uuids : [];

        // 1. Buscar o Grupo no banco para descobrir a qual benefício ele pertence
       
        const group = await this.benefitGroupsRepository.find(new Uuid(data.benefit_group_uuid));
        
        if (!group) {
            throw new CustomError("Grupo de benefícios não encontrado.", 404);
        }

        // 2. Agora usamos a informação segura que veio do banco de dados!
        const safeEmployerItemDetailsUuid = group.employer_item_details_uuid;

        // 3. Descobrir qual é o ID do Produto (Item) base
        const targetItemUuid = await this.businessItemDetailsRepository.findItemUuidByUuid(safeEmployerItemDetailsUuid.uuid);

        if (!targetItemUuid) {
            throw new CustomError("Configuração do benefício pai não encontrada.", 404);
        }

        // 4. Sincronizar
        await this.benefitGroupsRepository.syncMembers(
            business_info_uuid,
            data.benefit_group_uuid,
            targetItemUuid,
            employeesList
        );
    }
}
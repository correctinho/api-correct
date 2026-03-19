import { CustomError } from "../../../../../errors/custom.error";
import { IAppUserInfoRepository, OutputGetSimpleEmployeesDTO } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { OutputGetAvailableMembersDTO } from "./dto/get-available-members.dto";


export class GetAvailableMembersUsecase {
    constructor(
        private appUserInfoRepository: IAppUserInfoRepository,
        private benefitGroupsRepository: IBenefitGroupsRepository,
        private businessItemDetailsRepository: IBusinessItemDetailsRepository
    ) {}

    async execute(business_info_uuid: string, employer_item_details_uuid: string): Promise<OutputGetAvailableMembersDTO> {
        // Validações Básicas
        if (!business_info_uuid) throw new CustomError("Business ID is required", 400);
        if (!employer_item_details_uuid) throw new CustomError("Employer Item Details ID is required", 400);

        // 1. Descobrir qual é o ITEM (Produto) base desse grupo (ex: ID do produto 'Vale Refeição')
        const targetItemUuid = await this.businessItemDetailsRepository.findItemUuidByUuid(employer_item_details_uuid);

        if (!targetItemUuid) {
            throw new CustomError("Configuração do benefício não encontrada (Employer Item Details invalid)", 404);
        }
        
        // 2. Buscar funcionários e seus itens de forma otimizada
        // O repositório retorna o OutputGetSimpleEmployeesDTO
        const employees: OutputGetSimpleEmployeesDTO[] = await this.appUserInfoRepository.findSimpleListByBusiness(business_info_uuid);

        // 3. Buscar todos os grupos da empresa para criar um mapa de nomes (ID -> Nome)
        // Isso evita buscar o nome do grupo um por um dentro do loop (Performance)
        const allGroups = await this.benefitGroupsRepository.findAllByBusiness(business_info_uuid);
        
        const groupMap = new Map<string, string>();
        
        allGroups.forEach(group => {
             // Tratamento defensivo para pegar o UUID string, seja ele Value Object ou string pura
             const groupId = (group.uuid && typeof group.uuid === 'object' && 'uuid' in group.uuid) 
                ? group.uuid.uuid 
                : group.uuid.uuid as string;
            
            groupMap.set(groupId, group.group_name);
        });

        // 4. Cruzar os dados e montar a lista final
        const members = employees.map((emp) => {
            let currentGroup = null;

            // Lógica de Vínculo:
            // Procuramos dentro da lista de itens do usuário (UserItem) se ele possui
            // o item específico que estamos gerenciando (targetItemUuid).
            if (emp.UserInfo && emp.UserInfo.UserItem) {
                const benefitItem = emp.UserInfo.UserItem.find(
                    ui => ui.item_uuid === targetItemUuid
                );

                // Se encontramos o item E ele tem um grupo vinculado
                if (benefitItem && benefitItem.group_uuid) {
                    const groupName = groupMap.get(benefitItem.group_uuid);
                    
                    // Só retornamos o grupo se encontrarmos o nome dele (consistência de dados)
                    if (groupName) {
                        currentGroup = {
                            uuid: benefitItem.group_uuid,
                            name: groupName
                        };
                    }
                }
            }

            return {
                uuid: emp.uuid, // UUID do Employee
                name: emp.UserInfo?.full_name || "Nome não encontrado",
                function: emp.job_title, // Cargo (mapeado de job_title no repositório)
                current_group: currentGroup
            };
        });

        return { members };
    }
}
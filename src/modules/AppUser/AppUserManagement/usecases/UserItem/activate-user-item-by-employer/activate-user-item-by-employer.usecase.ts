import { ItemCategory, UserItemStatus } from '@prisma/client';
import { Uuid } from '../../../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../../../errors/custom.error';
import { BenefitGroupsEntity } from '../../../../../Company/BenefitGroups/entities/benefit-groups.entity';
import { IBenefitGroupsRepository } from '../../../../../Company/BenefitGroups/repositories/benefit-groups.repository';
import { IBusinessItemDetailsRepository } from '../../../../../Company/BusinessItemsDetails/repositories/business-item-details.repository';
import {
    AppUserItemCreateCommand,
    AppUserItemEntity,
} from '../../../entities/app-user-item.entity';
import { IAppUserItemRepository } from '../../../repositories/app-user-item-repository';
import {
    InputActivateUserItemByEmployer,
    OutputActivateUserItemByEmployer,
} from './dto/activate-user-item.dto';

/**
 * @summary Orquestra a ativação ou criação de um benefício específico para um funcionário,
 * atribuindo-o a um grupo de benefícios.
 *
 * @description
 * Este use case é a principal ferramenta do Empregador para conceder um benefício a um
 * funcionário. Ele implementa uma lógica de "Upsert": se o funcionário já possui o
 * benefício inativo, ele o ativa; se não possui, ele o cria já no estado ativo.
 * A fonte da verdade para o valor (`balance`) do benefício é sempre um Grupo.
 *
 * @responsibilities
 * 1. **Determinação do Grupo Alvo**:
 * - Se um `group_uuid` é fornecido na requisição, ele utiliza esse grupo específico.
 * - Se nenhum `group_uuid` é fornecido, ele busca e utiliza o "Grupo Padrão"
 * associado àquele benefício para a empresa.
 *
 * 2. **Lógica de Upsert do Benefício (`UserItem`)**:
 * - **Criação**: Se o funcionário não possui o benefício, este use case cria um novo
 * registro `UserItem`, definindo o status como 'active' e o `balance` com o valor
 * do grupo alvo.
 * - **Atualização**: Se o funcionário já possui o benefício com status 'inactive', este
 * use case atualiza o registro, mudando o status para 'active' e ajustando o
 * `balance` e o `group_uuid` para os do grupo alvo.
 *
 * 3. **Validação de Regras de Negócio**:
 * - Garante que o benefício já não esteja ativo para o funcionário para evitar duplicidade.
 * - Impede a reativação de benefícios que foram formalmente cancelados.
 * - Confirma que o grupo selecionado pertence à empresa em questão.
 *
 * @purpose
 * Simplificar o fluxo de trabalho do administrador de RH, oferecendo um único endpoint flexível
 * para conceder benefícios a um funcionário. Esta ação garante que o funcionário tenha acesso
 * ao benefício e que o valor creditado esteja sempre alinhado com as políticas de grupo
 * pré-definidas pela empresa, eliminando a necessidade de inserção manual de valores.
 */

export class ActivateUserItemByEmployerUsecase {
    constructor(
        private appUserItemRepository: IAppUserItemRepository,
        private groupsRepository: IBenefitGroupsRepository,
        private employerItemDetailsRepository: IBusinessItemDetailsRepository
    ) {}

    async execute(
        input: InputActivateUserItemByEmployer
    ): Promise<OutputActivateUserItemByEmployer> {
        let targetGroup: BenefitGroupsEntity;
        // Buscamos o "Employer Item" primeiro, pois ele contém a relação com os grupos e o item.
        const employerItem =
            await this.employerItemDetailsRepository.findByItemUuidAndBusinessInfo(
                input.business_info_uuid,
                input.item_uuid
            );
        if (!employerItem) {
            throw new CustomError(
                'Benefício não está ativo para esta empresa.',
                404
            );
        }
        // 1. Lógica para determinar o Grupo (Padrão ou Específico)
        if (input.group_uuid) {
            // Cenário B: Um grupo específico foi fornecido
            const specificGroup = await this.groupsRepository.find(
                new Uuid(input.group_uuid)
            );
            if (!specificGroup)
                throw new CustomError(
                    'Grupo especificado não encontrado.',
                    404
                );

            // Validação de segurança: o grupo pertence à empresa?
            if (
                specificGroup.business_info_uuid.uuid !==
                input.business_info_uuid
            ) {
                throw new CustomError(
                    'Grupo não pertence a esta empresa.',
                    403
                );
            }
            targetGroup = specificGroup;
        } else {
            // Cenário A: Nenhum grupo foi fornecido, busca o Padrão
            const defaultGroupData = employerItem.BenefitGroups.find(
                (g) => g.is_default
            );
            if (!defaultGroupData) {
                throw new CustomError(
                    'Grupo Padrão para este benefício não foi encontrado.',
                    404
                );
            }

            // Hidratamos o objeto de dados para ter uma instância de classe real
            targetGroup = BenefitGroupsEntity.hydrate({
                uuid: new Uuid(defaultGroupData.uuid),
                group_name: defaultGroupData.group_name,
                employer_item_details_uuid: new Uuid(
                    defaultGroupData.employer_item_details_uuid
                ),
                value: defaultGroupData.value, // Vem em centavos
                business_info_uuid: new Uuid(
                    defaultGroupData.business_info_uuid
                ),
                is_default: defaultGroupData.is_default,
                created_at: defaultGroupData.created_at,
            });
        }

        // 2. Lógica de "Upsert" do UserItem
        let employeeItemEntity =
            await this.appUserItemRepository.findItemByEmployeeAndBusiness(
                input.user_info_uuid,
                input.business_info_uuid,
                input.item_uuid
            );

        if (employeeItemEntity) {
            // Se o item JÁ EXISTE (estava inativo)
            if (employeeItemEntity.status === 'active') {
                if (
                    !input.group_uuid ||
                    input.group_uuid === employeeItemEntity.group_uuid.uuid
                ) {
                    throw new CustomError(
                        'Benefício já está ativo para este funcionário.',
                        409
                    );
                }
            }
            // A lógica de ativação já previne a reativação de um item cancelado.
            employeeItemEntity.activateStatus();
            employeeItemEntity.changeGroupUuid(targetGroup.uuid);
            employeeItemEntity.changeGroupValue(targetGroup.value);
            employeeItemEntity.changeBalance(targetGroup.value); // O getter já retorna em Reais

            await this.appUserItemRepository.update(employeeItemEntity);
        } else {
            // Se o item NÃO EXISTE (primeira vez), criamos a entidade do zero.
            const employeeItemData: AppUserItemCreateCommand = {
                user_info_uuid: new Uuid(input.user_info_uuid),
                business_info_uuid: new Uuid(input.business_info_uuid),
                item_uuid: new Uuid(input.item_uuid),
                group_uuid: targetGroup.uuid,
                item_name: employerItem.Item.name, // Nome do benefício
                item_category: employerItem.Item.item_category as ItemCategory, // Categoria do benefício
                balance: targetGroup.value, // O getter do targetGroup retorna em Reais
                status: 'active' as UserItemStatus,
                group_name: targetGroup.group_name,
                group_value: targetGroup.value,
                group_is_default: targetGroup.is_default,
            };

            employeeItemEntity = AppUserItemEntity.create(employeeItemData);

            await this.appUserItemRepository.create(employeeItemEntity);
        }

        // 3. Retorna o DTO de saída
        return {
            uuid: employeeItemEntity.uuid.uuid,
            user_info_uuid: employeeItemEntity.user_info_uuid.uuid,
            business_info_uuid: employeeItemEntity.business_info_uuid.uuid,
            item_uuid: employeeItemEntity.item_uuid.uuid,
            item_name: employeeItemEntity.item_name,
            balance: employeeItemEntity.balance,
            status: employeeItemEntity.status,
            created_at: employeeItemEntity.created_at,
            updated_at: employeeItemEntity.updated_at,
        };
    }
}

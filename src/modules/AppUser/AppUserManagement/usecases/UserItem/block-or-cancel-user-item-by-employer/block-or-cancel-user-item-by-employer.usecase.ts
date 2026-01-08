import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { newDateF } from "../../../../../../utils/date";
import { IBenefitsRepository } from "../../../../../benefits/repositories/benefit.repository";
import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { InputBlockOrCancelUserItemByEmployer, OutputBlockOrCancelUserItemByEmployer } from "./dto/block-or-cancel.dto";

export class BlockOrCanceluserItemByEmployerUsecase {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private itemRepository: IBenefitsRepository
  ) { }

  async execute(input: InputBlockOrCancelUserItemByEmployer): Promise<OutputBlockOrCancelUserItemByEmployer> {
    if (!input.user_item_uuid) throw new CustomError("User item uuid is required", 400)
    if (input.status === 'active') throw new CustomError("Invalid status", 400)

    // 1. Find user item by id
    const userItem = await this.appUserItemRepository.find(new Uuid(input.user_item_uuid))
    if (!userItem) throw new CustomError("User Item not found", 404)
    
    // 2. Check if business admin has access
    if (userItem.business_info_uuid.uuid !== input.business_info_uuid) throw new CustomError("Unauthorized acess", 403);

    // 3. Verify status to avoid redundancy
    if (userItem.status === 'cancelled' || userItem.status === 'to_be_cancelled') throw new CustomError("User item already cancelled", 400)

    // Variável para armazenar a mensagem de feedback do sistema
    let systemMessage: string | null = null;

    // --- LÓGICA DE BLOQUEIO ---
    if (input.status === 'blocked') {
      userItem.blockUserItem()
      userItem.changeBlockedAt(newDateF(new Date()))
      userItem.changeBlockReason(input.block_reason)
      
      systemMessage = "Benefício bloqueado temporariamente. O saldo foi mantido, mas o cartão não passará transações.";
    }

    // --- LÓGICA DE CANCELAMENTO ---
    if (input.status === 'cancelled' || input.status === 'to_be_cancelled') {
      
      if (userItem.item_category === 'pre_pago') {
        // Benefício Pré-Pago (PAT - VR/VA): Não pode confiscar saldo.
        // O método scheduleCancelling deve alterar o status para 'to_be_cancelled' e definir a data final
        await userItem.scheduleCancelling()

        userItem.changeCancelReason(input.cancel_reason)

        // Formata a mensagem avisando sobre o Aviso Prévio
        const dataFim = userItem.grace_period_end_date 
            ? new Date(userItem.grace_period_end_date).toLocaleDateString('pt-BR') 
            : 'data a definir';

        systemMessage = `Solicitação aceita. Por ser um benefício pré-pago (PAT), o usuário entrou em aviso prévio para uso do saldo remanescente até ${dataFim}.`;
        
      } else if (userItem.item_category === 'pos_pago') {
        // Benefício Pós-Pago: Cancela na hora.
        userItem.cancelPostPaidUserItem()

        userItem.changeCancelReason(input.cancel_reason)

        systemMessage = "Cancelamento efetuado com sucesso. O acesso ao benefício foi revogado imediatamente.";
      }
    }

    // 4. Persist
    await this.appUserItemRepository.update(userItem)

    // 5. Return with System Message
    return {
      uuid: userItem.uuid.uuid,
      user_info_uuid: userItem.user_info_uuid.uuid,
      item_uuid: userItem.item_uuid.uuid,
      item_name: userItem.item_name,
      balance: userItem.balance,
      status: userItem.status, // Aqui retornará 'to_be_cancelled' se for pré-pago
      blocked_at: userItem.blocked_at ? userItem.blocked_at : null,
      cancelled_at: userItem.cancelled_at ? userItem.cancelled_at : null,
      cancelling_request_at: userItem.cancelling_request_at ? userItem.cancelling_request_at : null,
      block_reason: userItem.block_reason ? userItem.block_reason : null,
      cancel_reason: userItem.cancel_reason ? userItem.cancel_reason : null,
      grace_period_end_date: userItem.grace_period_end_date ? userItem.grace_period_end_date : null,
      created_at: userItem.created_at,
      updated_at: userItem.updated_at,
      
      system_message: systemMessage // Retorno da mensagem explicativa
    }
  }
}
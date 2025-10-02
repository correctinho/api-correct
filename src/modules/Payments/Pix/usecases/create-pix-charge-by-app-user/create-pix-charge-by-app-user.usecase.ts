import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IPixProvider } from "../../../../../infra/providers/PixProvider/IPixProvider";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ITransactionOrderRepository } from "../../../Transactions/repositories/transaction-order.repository";
import { InputCreatePixChargeDTO, OutputCreatePixChargeDTO } from "./dto/create-pix-charge.dto";

export class CreatePixChargeByAppUserUsecase {
    constructor(
        private readonly pixProvider: IPixProvider,
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly userInfoRepository: IAppUserInfoRepository,
        private readonly userItemRepository: IAppUserItemRepository
    ) { }

    async execute(input: InputCreatePixChargeDTO): Promise<OutputCreatePixChargeDTO> {
        // 1. Validação de Entrada
        if (!input.userId || !input.amountInReais || input.amountInReais <= 0) {
            throw new CustomError("User ID e um valor positivo são necessários.", 400);
        }

        // 2. Busca dos dados do usuário (pagador/devedor)
        const userInfo = await this.userInfoRepository.find(new Uuid(input.userId));
        if (!userInfo) {
            throw new CustomError("Usuário não encontrado.", 404);
        }
        
        //3. Find Item to be credited - currently it will be Correct Card
        const userItem = await this.userItemRepository.findDebitUserItem(userInfo.uuid.uuid)
        if (!userItem) throw new CustomError("Usuário não possui um cartão de débito associado.", 400);

        // 4. Criação da nossa transação interna com status 'pending'
        const amountInCents = Math.round(input.amountInReais * 100);
        const pendingTransaction = await this.transactionRepository.createPendingCashIn(
            new Uuid(input.userId),
            userItem.uuid,
            amountInCents
        );

        // 5. Prepara os dados para o Provedor PIX
        const chargeData = {
            cpf: userInfo.document,
            nome: userInfo.full_name,
            valor: input.amountInReais.toFixed(2),
            chave: process.env.SICREDI_PIX_KEY!,
        };

        // 6. Chama o Provedor (Sicredi, neste caso) para criar a cobrança PIX
        const pixChargeResult = await this.pixProvider.createImmediateCharge(chargeData);

        // 7. Atualiza nossa transação interna com o txid do provedor
        await this.transactionRepository.updateTxId(pendingTransaction.uuid, pixChargeResult.txid);

        // 8. Retorna os dados para o frontend
        return {
            transactionId: pendingTransaction.uuid.uuid,
            pixCopyPaste: pixChargeResult.pixCopiaECola,
        };
    }
}
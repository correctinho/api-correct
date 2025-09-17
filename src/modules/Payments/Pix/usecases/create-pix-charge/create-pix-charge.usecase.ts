import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IPixProvider } from "../../../../../infra/providers/PixProvider/IPixProvider";
import { IAppUserInfoRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-info.repository";
import { ITransactionOrderRepository } from "../../../Transactions/repositories/transaction-order.repository";
import { InputCreatePixChargeDTO, OutputCreatePixChargeDTO } from "./dto/create-pix-charge.dto";
import qrcode from 'qrcode';

export class CreatePixChargeUsecase {
    constructor(
        private readonly pixProvider: IPixProvider,
        private readonly transactionRepository: ITransactionOrderRepository,
        private readonly userInfoRepository: IAppUserInfoRepository
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
        
        // 3. Criação da nossa transação interna com status 'pending'
        const amountInCents = Math.round(input.amountInReais * 100);
        const pendingTransaction = await this.transactionRepository.createPendingCashIn(
            new Uuid(input.userId),
            amountInCents
        );

        // 4. Prepara os dados para o Provedor PIX
        const chargeData = {
            cpf: userInfo.document,
            nome: userInfo.full_name,
            valor: input.amountInReais.toFixed(2),
            chave: process.env.SICREDI_PIX_KEY!,
        };

        // 5. Chama o Provedor (Sicredi, neste caso) para criar a cobrança PIX
        const pixChargeResult = await this.pixProvider.createImmediateCharge(chargeData);

        // 6. Atualiza nossa transação interna com o txid do provedor
        await this.transactionRepository.updateTxId(pendingTransaction.uuid, pixChargeResult.txid);

        // 7. Retorna os dados para o frontend
        return {
            transactionId: pendingTransaction.uuid.uuid,
            pixCopyPaste: pixChargeResult.pixCopiaECola,
        };
    }
}
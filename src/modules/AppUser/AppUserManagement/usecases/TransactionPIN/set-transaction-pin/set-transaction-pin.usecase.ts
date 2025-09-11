import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../../errors/custom.error";
import { IPasswordCrypto } from "../../../../../../infra/shared/crypto/password.crypto"; 
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { InputSetAppUserPinDTO, OutputSetAppUserPinDTO } from "./dto/set-transaction-pin.dto";

export class SetAppUserTransactionPinUsecase {
    // Passo 1: Injetamos as dependências necessárias no construtor.
    constructor(
        private readonly appUserAuthRepository: IAppUserAuthRepository,
        private readonly hashService: IPasswordCrypto // Agora o serviço de hash é uma dependência
    ) { }

    async execute(input: InputSetAppUserPinDTO): Promise<OutputSetAppUserPinDTO> {
        // Passo 2: Validações de entrada PRIMEIRO.
        if (!input.userId || !input.newPin || !input.password) {
            throw new CustomError("User ID, new PIN, and password are required.", 400);
        }
        if (!/^\d{4}$|^\d{6}$/.test(input.newPin)) {
            throw new CustomError("PIN must be 4 or 6 digits.", 400);
        }

        const userId = new Uuid(input.userId);

        // Passo 3: Busca o registro de autenticação do usuário.
        const userAuth = await this.appUserAuthRepository.find(userId);
        if (!userAuth) {
            throw new CustomError("User not found.", 404);
        }

        // Passo 4: VERIFICAÇÃO DE IDENTIDADE.
        // Usamos o hashService injetado e passamos os dois argumentos.
        const isPasswordValid = await this.hashService.compare(input.password, userAuth.password);
        if (!isPasswordValid) {
            throw new CustomError("Invalid password.", 403); // 403 Forbidden
        }

        // Passo 5: Criptografa o novo PIN (somente após todas as validações passarem).
        const newPinHash = await this.hashService.hash(input.newPin);

        // Passo 6: Persiste o novo PIN hasheado no banco de dados.
        await this.appUserAuthRepository.updateTransactionPin(userId.uuid, newPinHash);

        // Passo 7: Retorna uma mensagem de sucesso.
        const message = userAuth.transaction_pin
            ? "PIN de transação alterado com sucesso."
            : "PIN de transação criado com sucesso.";

        return {
            success: true,
            message: message
        };
    }
}
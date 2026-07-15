import { CustomError } from "../../../../../errors/custom.error";
import { IBusinessFirstRegisterRepository, CheckBusinessStatusResult } from "../../repositories/business-first-register.repository";

export class CheckBusinessStatusUseCase {
    constructor(private repository: IBusinessFirstRegisterRepository) {}

    async execute(document: string): Promise<CheckBusinessStatusResult> {
        const cleanDoc = document.replace(/\D/g, "");

        const result = await this.repository.checkBusinessStatus(cleanDoc);

        if (!result) {
            throw new CustomError("Estabelecimento não encontrado", 404);
        }

        return result;
    }
}

import { CustomError } from "../../../../../../errors/custom.error";
import { prismaClient } from "../../../../../../infra/databases/prisma.config";
import { ISlackProvider } from "../../../../../../infra/providers/SlackProvider";

export class CreateMassRegistrationUseCase {
    constructor(
        private slackProvider: ISlackProvider
    ) {}

    async execute(business_info_uuid: string, file_content: string) {
        if (!file_content) {
            throw new CustomError("O arquivo CSV está vazio ou inválido", 400);
        }

        // Recupera o nome da empresa
        const business = await prismaClient.businessInfo.findUnique({
            where: { uuid: business_info_uuid }
        });

        if (!business) {
            throw new CustomError("Empresa não encontrada", 404);
        }

        const companyName = business.corporate_reason || business.fantasy_name || 'Desconhecido';

        // Salva a requisição no banco
        const request = await prismaClient.massRegistrationRequest.create({
            data: {
                business_info_uuid:
business_info_uuid,
                file_content,
                status: "PENDING"
            }
        });

        // Envia alerta pro Slack
        await this.slackProvider.sendMassRegistrationAlert(companyName, request.uuid);

        return request;
    }
}

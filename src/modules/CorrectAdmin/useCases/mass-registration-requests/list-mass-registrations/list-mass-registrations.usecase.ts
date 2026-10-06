import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class ListMassRegistrationsUseCase {
    async execute() {
        const requests = await prismaClient.massRegistrationRequest.findMany({
            orderBy: { created_at: "desc" }
        });

        const businessUuids = requests.map(r => r.business_info_uuid);
        const businesses = await prismaClient.businessInfo.findMany({
            where: { uuid: { in: businessUuids } },
            select: { uuid: true, corporate_reason: true, fantasy_name: true, document: true }
        });

        const mappedRequests = requests.map(request => {
            const business = businesses.find(b => b.uuid === request.business_info_uuid);
            return {
                ...request,
                file_content: undefined, // não enviar CSV pesado pra listagem
                company_name: business?.corporate_reason || business?.fantasy_name || 'Empresa Desconhecida',
                company_document: business?.document || ''
            };
        });

        return mappedRequests;
    }
}

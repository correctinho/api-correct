import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CustomError } from "../../../../../errors/custom.error";

interface IRequest {
    uuid: string;
    file_content: string;
}

export class UpdateMassRegistrationUseCase {
    async execute({ uuid, file_content }: IRequest) {
        const massRequest = await prismaClient.massRegistrationRequest.findUnique({
            where: { uuid }
        });

        if (!massRequest) {
            throw new CustomError("Solicitação não encontrada.", 404);
        }

        if (massRequest.status === 'PROCESSED') {
            throw new CustomError("Solicitações já processadas não podem ser alteradas.", 400);
        }

        const updatedRequest = await prismaClient.massRegistrationRequest.update({
            where: { uuid },
            data: {
                file_content
            },
            select: {
                uuid: true,
                business_info_uuid: true,
                status: true,
                created_at: true
            }
        });

        return {
            message: "Planilha atualizada com sucesso",
            request: updatedRequest
        };
    }
}

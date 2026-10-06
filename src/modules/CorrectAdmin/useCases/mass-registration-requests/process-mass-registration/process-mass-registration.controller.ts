import { Request, Response } from "express";
import { CreateAppUserByCorrectUsecaseTest } from "../../../../../modules/AppUser/UserByCorrect/usecases/create-appuser-data-by-correct/create-appuser-data-by-correct.usecase";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CustomError } from "../../../../../errors/custom.error";

export class ProcessMassRegistrationController {
  constructor(
    private appUserInfoRepository: any,
    private businessRepository: any,
    private appUserAuthRepository: any,
    private employerItemsRepository: any,
    private employeeItemRepository: any,
    private benefitsRepository: any
  ) { }

  async handle(req: Request, res: Response) {
    try {
        const { uuid } = req.params;
        const request = await prismaClient.massRegistrationRequest.findUnique({ where: { uuid } });
        if (!request) throw new CustomError("Solicitação não encontrada", 404);
        if (request.status === "PROCESSED") throw new CustomError("Solicitação já foi processada", 400);

        const data: any = {};
        data.business_info_uuid = request.business_info_uuid;
        data.fileBuffer = Buffer.from(request.file_content, "utf8");

        const appUserUsecase = new CreateAppUserByCorrectUsecaseTest(
            this.appUserInfoRepository,
            this.businessRepository,
            this.appUserAuthRepository,
            this.employerItemsRepository,
            this.employeeItemRepository,
            this.benefitsRepository
        );

        const result = await appUserUsecase.execute(data);

        await prismaClient.massRegistrationRequest.update({
            where: { uuid },
            data: { status: "PROCESSED" }
        });

        return res.status(200).json({ message: "Planilha processada com sucesso!", details: result });
    } catch (err: any) {
        return res.status(err.statusCode || 500).json({
            error: err.message || "Erro inesperado ao processar planilha"
        });
    }
  }
}

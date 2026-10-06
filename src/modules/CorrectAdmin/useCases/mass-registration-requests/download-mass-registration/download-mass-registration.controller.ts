import { Request, Response } from "express";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { CustomError } from "../../../../../errors/custom.error";

export class DownloadMassRegistrationController {
  async handle(req: Request, res: Response) {
    try {
        const { uuid } = req.params;
        const request = await prismaClient.massRegistrationRequest.findUnique({ where: { uuid } });
        if (!request) throw new CustomError("Solicitação não encontrada", 404);

        const business = await prismaClient.businessInfo.findUnique({ where: { uuid: request.business_info_uuid }});
        
        const safeName = (business?.fantasy_name || 'empresa').replace(/[^\w-]/g, '_');
        
        res.setHeader('Content-disposition', `attachment; filename=cadastro_${safeName}.csv`);
        res.set('Content-Type', 'text/csv; charset=utf-8');
        return res.status(200).send(request.file_content);
    } catch (err: any) {
        return res.status(err.statusCode || 500).json({
            error: err.message || "Erro inesperado ao baixar planilha"
        });
    }
  }
}

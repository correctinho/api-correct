import { Request, Response } from "express";
import { IPartnerDashboardRepository } from "../repositories/partner-dashboard.repository";
import { GetPartnerDashboardUseCase } from "./get-partner-dashboard-metrics.usecase";

export class GetPartnerDashboardController {
  constructor(
    private partnerDashboardRepository: IPartnerDashboardRepository
  ) {}

  async handle(req: Request, res: Response) {
    try {
      // O middleware de autenticação (ensureAuthenticated) popula o req.companyUser
      // Garantimos que pegamos o businessInfoUuid, pois o dashboard é DO NEGÓCIO, não do usuário
      const businessInfoUuid = req.companyUser.businessInfoUuid;

      if (!businessInfoUuid) {
        return res.status(403).json({ error: "User is not associated with a business." });
      }

      // Instancia o UseCase injetando o repositório recebido no construtor
      const useCase = new GetPartnerDashboardUseCase(this.partnerDashboardRepository);

      // Executa a lógica
      const dashboardData = await useCase.execute(businessInfoUuid);

      return res.status(200).json(dashboardData);

    } catch (err: any) {
      // Tratamento de erro padrão
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message
      });
    }
  }
}
import { Request, Response } from "express";
import { GetDashboardStatsUsecase } from "./get-dashboard-stats.usecase";

export class GetDashboardStatsController {
  constructor(private usecase: GetDashboardStatsUsecase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await this.usecase.execute();
      return res.status(200).json(stats);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        error: error.message || "Internal Server Error"
      });
    }
  }
}

import { Request, Response } from "express";
import { GetPartnerSalesUseCase } from "./get-partner-sales.usecase";
import { CustomError } from "../../../../../errors/custom.error";
import { ITransactionOrderRepository } from "../../repositories/transaction-order.repository";

export class GetPartnerSalesController {
  constructor(private readonly transactionRepository: ITransactionOrderRepository) { }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const data = request.body;
      const businessInfoUuid = request.companyUser.businessInfoUuid

      if (!businessInfoUuid) {
        throw new CustomError("Partner not found", 404);
      }

      // Parse pagination from query string
      const pageQuery = request.query.page;
      const limitQuery = request.query.limit;

      const page = pageQuery ? parseInt(pageQuery as string, 10) : 1;
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : 15;

      if (isNaN(page) || page < 1) {
        throw new CustomError("Invalid page parameter", 400);
      }

      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new CustomError("Invalid limit parameter (must be between 1 and 100)", 400);
      }
      const usecase = new GetPartnerSalesUseCase(this.transactionRepository)
      const result = await usecase.execute({
        business_info_uuid: businessInfoUuid,
        page,
        limit
      });

      return response.status(200).json(result);
    } catch (error: any) {
      if (!error.statusCode || error.statusCode === 500) {
        console.error("[GetPartnerSalesController] Error:", error);
      }
      return response.status(error.statusCode || 500).json({
        error: error.message || "Unexpected error."
      });
    }
  }
}

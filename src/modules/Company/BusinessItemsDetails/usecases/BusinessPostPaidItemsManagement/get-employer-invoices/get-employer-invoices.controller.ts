import { Request, Response } from "express";
import { ListInvoicesUsecase } from "../../../../../Invoices/application/usecases/list-invoices.usecase";

export class GetEmployerInvoicesController {
  constructor(private listInvoicesUseCase: ListInvoicesUsecase) { }

  async handle(request: Request, response: Response): Promise<Response> {
    const { page, limit, status, reference_month } = request.query;

    const input = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string,
      business_info_uuid: request.companyUser.businessInfoUuid, // Forced to company's UUID
      reference_month: reference_month as string,
    };

    const result = await this.listInvoicesUseCase.execute(input);
    return response.status(200).json(result);
  }
}

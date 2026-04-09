import { Request, Response } from "express";
import { ListInvoicesUsecase } from "../../application/usecases/list-invoices.usecase";

export class ListInvoicesController {
  constructor(private listInvoicesUseCase: ListInvoicesUsecase) { }

  async handle(request: Request, response: Response): Promise<Response> {
    const { page, limit, status, business_info_uuid, reference_month } = request.query;

    const input = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string,
      business_info_uuid: business_info_uuid as string,
      reference_month: reference_month as string,
    };

    const result = await this.listInvoicesUseCase.execute(input);
    console.log(result)
    return response.status(200).json(result);
  }
}

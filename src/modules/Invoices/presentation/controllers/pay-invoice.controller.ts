import { Request, Response } from "express";
import { PayInvoiceUsecase } from "../../application/usecases/pay-invoice.usecase";

export class PayInvoiceController {
  constructor(private payInvoiceUseCase: PayInvoiceUsecase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { uuid } = request.params;

    const result = await this.payInvoiceUseCase.execute({ uuid });

    return response.status(200).json(result);
  }
}

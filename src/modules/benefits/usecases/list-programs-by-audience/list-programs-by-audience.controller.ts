import { Request, Response } from "express";
import { ListProgramsByAudienceUseCase } from "./list-programs-by-audience.usecase";

export class ListProgramsByAudienceController {
  constructor(private usecase: ListProgramsByAudienceUseCase) {}

  async handle(req: Request, res: Response) {
    try {
      // O App User sempre busca programas com planos pagos pelo próprio usuário
      const payerType = 'USER';
      
      const result = await this.usecase.execute(payerType);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

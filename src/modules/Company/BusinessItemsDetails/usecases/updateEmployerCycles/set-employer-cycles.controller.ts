import { Request, Response } from "express";
import { CustomError } from "../../../../../errors/custom.error";
import { IBusinessItemDetailsRepository } from "../../repositories/business-item-details.repository";
import { InputSetEmployerCyclesDTO, OutputSetEmployerCyclesDTO } from "./dto/set-cycles.dto";
import { SetEmployerCycleUsecase } from "./set-employer-cycles.usecase";

export class SetEmployerCycleController {
  constructor(
    private itemDetailsRepository: IBusinessItemDetailsRepository,
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data: InputSetEmployerCyclesDTO = req.body

      const usecase = new SetEmployerCycleUsecase(this.itemDetailsRepository)

      const result = await usecase.execute(data)

      return res.json(result)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}

import { Request, Response } from "express";
import { ICorrectAdminRepository } from "../../../../modules/CorrectAdmin/repositories/correct-admin.repository";
import { EnsureValidCorrectAdminUsecase } from "./ensure-valid-correct-admin.usecase.middlware";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";


export class EnsureValidCorrectAdminController {
  constructor(
    private correctAdminRepository: ICorrectAdminRepository
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const correctAdminId = req.correctAdmin.correctAdminId
      const validAdminUsecase = new EnsureValidCorrectAdminUsecase(
        this.correctAdminRepository
      )

      const admin = await validAdminUsecase.execute(new Uuid(correctAdminId))

      return {
        uuid: admin.uuid,
        userName: admin.userName,
        email: admin.email,
        isAdmin: admin.isAdmin
      }

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }
  }
}

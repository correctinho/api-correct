import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { GetSingleUserUsecase } from "./get-single-user.usecase";

export class GetSingleUserController {
  constructor(
    private companyUserRepository: ICompanyUserRepository
  ) { }

  async handle(req: Request, res: Response) {

    try {
      const user_uuid = req.query.user_uuid as string

      const companyUserDetailsUsecase = new GetSingleUserUsecase(
        this.companyUserRepository
      )

      const companyUser = await companyUserDetailsUsecase.execute(user_uuid)

      return res.json(companyUser)

    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message
      })
    }


  }
}

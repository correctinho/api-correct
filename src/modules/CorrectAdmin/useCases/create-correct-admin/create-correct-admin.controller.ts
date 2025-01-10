import { Request, Response } from "express";
import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository";
import { CreateCorrectAdminUseCase } from "./create-correct-admin.usecase";

export class CreateCorrectAdminController {
    constructor(
        private adminRepository: ICorrectAdminRepository
    ){}
    async handle(req: Request, res: Response){
        try{
            const data = req.body

            const adminUseCase = new CreateCorrectAdminUseCase(this.adminRepository)

            const result = await adminUseCase.execute(data)

            return res.status(201).json(result)
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}

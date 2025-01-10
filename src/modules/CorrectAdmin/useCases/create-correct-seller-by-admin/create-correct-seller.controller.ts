import { Request, Response } from "express";
import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository";
import { CreateCorrectSellerByAdminUseCase } from "./create-correct-seller.usecase";

export class CreateCorrectSellerByAdminController {
    constructor(
        private adminRepository: ICorrectAdminRepository
    ){}
    async handle(req: Request, res: Response){
        try{
            const data = req.body

            data.isAdmin = req.correctAdmin.isAdmin

            const adminUseCase = new CreateCorrectSellerByAdminUseCase(this.adminRepository)

            const result = await adminUseCase.execute(data)

            return res.status(201).json(result)
        }catch(err: any){
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}

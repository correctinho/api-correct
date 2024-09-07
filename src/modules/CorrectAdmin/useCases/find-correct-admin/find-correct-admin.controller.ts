import { ICorrectAdminRepository } from "../../repositories/correct-admin.repository"
import { Request, Response } from "express";

export class FindCorrectAdminController {
  constructor(
    private correctAdminRepository: ICorrectAdminRepository
){}

async handle(req: Request, res: Response){
    try{

        const admin = req.correctAdmin
        return res.json(admin)

    }catch(err:any){
        return res.status(err.statusCode).json({
            error: err.message
        })
    }
}
}

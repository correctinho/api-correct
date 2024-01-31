import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { DeleteUserByAdminUsecase } from "./delete-user-by-admin.usecase";
import { logger } from "../../../../../utils/logger";

export class DeleteUserByAdminController {
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) { }
    async handle(req: Request, res: Response) {

        try {
            const user_id = req.query.user_id as string

            const deleteUsecase = new DeleteUserByAdminUsecase(this.companyUserRepository)

            await deleteUsecase.execute(user_id)


            // return res.json(deleteUser)

            return res.json({ message: "Usuário excluído com sucesso" })

        } catch (err: any) {
            logger.error(err.stack)
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}
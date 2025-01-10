import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { DeleteUserByAdminUsecase } from "./delete-user-by-admin.usecase";

export class DeleteUserByAdminController {
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ) { }
    async handle(req: Request, res: Response) {

        try {
            const user_id = req.query.user_id as string
            const business_info_uuid = req.companyUser.businessInfoUuid
            const deleteUsecase = new DeleteUserByAdminUsecase(this.companyUserRepository)

            await deleteUsecase.execute(user_id, business_info_uuid)

            // return res.json(deleteUser)

            return res.json({ message: "Usuário excluído com sucesso" })

        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message
            })
        }
    }
}

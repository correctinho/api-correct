import { Request, Response } from "express";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";
import { UpdateAdminByAdminUsecase } from "./update-admin-by-admin.usecase";
import { IPasswordCrypto } from "../../../../../crypto/password.crypto";
import { InputUpdateBusinessAdminByAdminDTO } from "./dto/update-admin-by-admin.dto";

export class UpdateAdminByAdminController {
  constructor(
    private companyUserRepository: ICompanyUserRepository,
    private passwordCrypto: IPasswordCrypto,
  ) { }

  async handle(req: Request, res: Response) {
    try {
      const data: InputUpdateBusinessAdminByAdminDTO = req.body;
      
      // Pegamos apenas o ID do usuário autenticado que está no Request
      const authUserId = req.companyUser.companyUserId;

      const updateUserUsecase = new UpdateAdminByAdminUsecase(
          this.companyUserRepository, 
          this.passwordCrypto
      );

      // Passamos ID + Dados
      const result = await updateUserUsecase.execute(authUserId, data);

      return res.json(result);

    } catch (err: any) {
      // Garante que o status code seja respeitado ou retorna 400 por padrão
      const statusCode = err.statusCode || 400;
      return res.status(statusCode).json({
        error: err.message
      });
    }
  }
}
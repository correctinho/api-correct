import { Request, Response, NextFunction } from "express"
import { AppUserAuthPrismaRepository } from "../../../../modules/AppUser/AppUserManagement/repositories/implementations-user-auth/app-user-auth-prisma.repository"
import { EnsureValidAppUserController } from "./ensure-valid-app-user.controller.middlware"
import { AppUserJWToken } from "../../crypto/token/AppUser/jwt.token"
import { api } from "../../../axios/axios.config"
import { IAppUserAuthRepository } from "../../../../modules/AppUser/AppUserManagement/repositories/app-use-auth-repository"
import { AppUserAuthSignUpEntity } from "../../../../modules/AppUser/AppUserManagement/entities/app-user-auth.entity"

export const appUserIsAuth = async (req: Request, res: Response, next: NextFunction) => {

  const headerAuth = req.headers.authorization

  if (!headerAuth) return res.status(401).json({
    error: 'Token is missing'
  })

  const [, token] = headerAuth.split(" ")

  if (!token) return res.status(401).json({
    error: 'Token is missing'
  })

  try {
    const response = await api.post("/api/v1/jwt/decode", {
      token: token
    });
    const verifyToken = response.data;

    if (verifyToken) {
      req.appUser = {
        appUserId: verifyToken.data.user_uuid,
        document: '',
        email: '',
        created_at: '',
        updated_at: '',
        user_info_uuid: ''
      }

      const appUserAuthRepository = new AppUserAuthPrismaRepository()
      const ensureValidAAppUser = new EnsureValidAppUserController(appUserAuthRepository)

      const user = await ensureValidAAppUser.handle(req, res) as AppUserAuthSignUpEntity
      req.appUser = {
        appUserId: user.uuid.uuid,
        document: user.document,
        email: user.email,
        user_info_uuid: user.user_info_uuid ? user.user_info_uuid.uuid : null,
        created_at: user.created_at,
        updated_at: user.updated_at ? user.updated_at : null,

      }
      return next()
    }
  } catch (err: any) {

    console.log("Erro ao verificar token do app user");

  }


  return res.status(401).json({
    error: "Authentication Error"
  })
}

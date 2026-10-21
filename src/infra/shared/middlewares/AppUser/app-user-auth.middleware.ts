import { Request, Response, NextFunction } from "express"
import { AppUserAuthPrismaRepository } from "../../../../modules/AppUser/AppUserManagement/repositories/implementations-user-auth/app-user-auth-prisma.repository"
import { EnsureValidAppUserUsecase } from "./ensure-valid-app-user.usecase.middleware"
import { AppUserJWToken } from "../../crypto/token/AppUser/jwt.token"
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo"

export const appUserIsAuth = async (req: Request, res: Response, next: NextFunction) => {

  const headerAuth = req.headers.authorization

  if (!headerAuth) return res.status(401).json({
    error: 'Token is missing'
  })

  const [, token] = headerAuth.split(" ")

  if (!token) return res.status(401).json({
    error: 'Token is missing'
  })

  //monolito mode
  const verifyToken = new AppUserJWToken().validate(token)

  if (verifyToken && verifyToken.sub) {
    try {
      const appUserAuthRepository = new AppUserAuthPrismaRepository()
      const validAppUserUsecase = new EnsureValidAppUserUsecase(appUserAuthRepository)
      const user = await validAppUserUsecase.execute(new Uuid(verifyToken.sub))

      req.appUser = {
        appUserId: user.uuid.uuid,
        document: user.document,
        email: user.email,
        password: '',
        transaction_pin: user.transaction_pin ? user.transaction_pin : null,
        user_info_uuid: user.user_info_uuid ? user.user_info_uuid.uuid : null,
        created_at: user.created_at,
        updated_at: user.updated_at ? user.updated_at : null,
      }
      return next()
    } catch (err: any) {
      return res.status(err.statusCode || 401).json({
        error: err.message || "Authentication Error"
      })
    }
  }

  return res.status(401).json({
    error: "Authentication Error"
  })
}

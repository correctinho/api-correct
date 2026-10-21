import { Request, Response, NextFunction } from "express"
import { CompanyAdminJWToken } from "../../crypto/token/CompanyAdmin/jwt.token"
import { CompanyUserPrismaRepository } from "../../../../modules/Company/CompanyUser/repositories/implementations/company-user.prisma.repository"
import { EnsureValidCompanyUserUsecase } from "./ensure-valid-company-admin.usecase.middlware"

export const companyIsAuth = async (req: Request, res: Response, next: NextFunction) => {

  const headerAuth = req.headers.authorization

  if (!headerAuth) return res.status(401).json({
    error: 'Token is missing'
  })

  const [, token] = headerAuth.split(" ")

  if (!token) return res.status(401).json({
    error: 'Token is missing'
  })

  //monolito mode
  const verifyToken = new CompanyAdminJWToken().validate(token)
  if (verifyToken && verifyToken.sub) {
    try {
      const companyUserRepository = new CompanyUserPrismaRepository()
      const validUserUsecase = new EnsureValidCompanyUserUsecase(companyUserRepository)
      const user = await validUserUsecase.execute(verifyToken.sub)

      req.companyUser = {
        companyUserId: user.uuid,
        businessInfoUuid: user.businessInfoUuid,
        password: user.password,
        isAdmin: user.isAdmin,
        document: user.document,
        name: user.name,
        email: user.email,
        userName: user.userName,
        function: user.function,
        permissions: user.permissions,
        status: user.status,
        fantasy_name: user.fantasy_name,
        corporate_reason: user.corporate_reason,
        created_at: user.created_at,
        updated_at: user.updated_at ? user.updated_at : null,
      }

      return next()
    } catch (err: any) {
      return res.status(err.statusCode || 401).json({
        error: err.message || "User is not allowed to access"
      })
    }
  }

  return res.status(401).json({
    error: "Invalid Token"
  })

}

import { Request, Response, NextFunction } from "express"
import { CompanyAdminJWToken } from "../../crypto/token/CompanyAdmin/jwt.token"
import { CompanyUserPrismaRepository } from "../../../../modules/Company/CompanyUser/repositories/implementations/company-user.prisma.repository"
import { EnsureValidCompanyUserController } from "./ensure-valid-company-auth.controller.middleware"
import { api } from "../../../axios/axios.config"
import { OutputCompanyUserDTO } from "./ensure-valid-company-admin.usecase.middlware"

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
  if (verifyToken) {
    req.companyUser = {
      companyUserId: verifyToken.sub,
      businessInfoUuid: '',
      password: '',
      isAdmin: false,
      document: '',
      name: '',
      email: '',
      userName: '',
      function: '',
      permissions: [''],
      status: '',
      created_at: '',
      updated_at: ''
    }

    const companyUserRepository = new CompanyUserPrismaRepository()
    const ensureValidUser = new EnsureValidCompanyUserController(companyUserRepository)
    const user = await ensureValidUser.handle(req, res) as OutputCompanyUserDTO

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
      created_at: user.created_at,
      updated_at: user.updated_at ? user.updated_at : null,
    }

    return next()
  }
  //jwt with go ms

  // try {
  //   const response = await api.post("/api/v1/jwt/decode", {
  //     token: token
  //   });
  //   const verifyToken = response.data;

  //   if (verifyToken) {
  //     req.companyUser = {
  //       companyUserId: verifyToken.data.user_uuid,
  //       businessInfoUuid: '',
  //       isAdmin: false,
  //       document: '',
  //       name: '',
  //       email: '',
  //       userName: '',
  //       function: '',
  //       permissions: [''],
  //       status: '',
  //       created_at: '',
  //       updated_at: ''
  //     }


  //     const companyUserRepository = new CompanyUserPrismaRepository()
  //     const ensureValidUser = new EnsureValidCompanyUserController(companyUserRepository)
  //     const user = await ensureValidUser.handle(req, res) as OutputCompanyUserDTO

  //     req.companyUser = {
  //       companyUserId: user.uuid,
  //       businessInfoUuid: user.businessInfoUuid,
  //       isAdmin: user.isAdmin,
  //       document: user.document,
  //       name: user.name,
  //       email: user.email,
  //       userName: user.userName,
  //       function: user.function,
  //       permissions: user.permissions,
  //       status: user.status,
  //       created_at: user.created_at,
  //       updated_at: user.updated_at ? user.updated_at : null,
  //     }

  //     return next()
  //   }
  // } catch (err: any) {
  //   console.log("Erro ao verificar token do company admin");

  // }

  return res.status(401).json({
    error: "Invalid Token"
  })

}

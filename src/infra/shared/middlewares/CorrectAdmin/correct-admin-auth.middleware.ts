import { Request, Response, NextFunction } from "express";
import { JWTToken } from "../../crypto/token/CorrectAdmin/jwt.token";
import { CorrectAdminPrismaRepository } from "../../../../modules/CorrectAdmin/repositories/implementations/correct-admin.prisma.repository";
import { EnsureValidCorrectAdminController } from "./ensure-valid-correct-admin.controller.midleware";
import { api } from "../../../axios/axios.config";
import { OutputAdminDetailDTO } from "./ensure-valid-correct-admin.usecase.middlware";
import { Console } from "winston/lib/winston/transports";

export const correctIsAuth = async (req: Request, res: Response, next: NextFunction) => {
  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    return res.status(401).json({
      error: 'Token is required'
    });
  }

  const [, token] = headerAuth.split(" ");

  if (!token) {
    return res.status(401).json({
      error: 'Token is required'
    });
  }

  try {
    const response = await api.post("/api/v1/jwt/decode", {
      token: token
    });
    const verifyToken = response.data;

    if (verifyToken) {
      // Inicialize req.correctAdmin com todas as propriedades necessárias
      req.correctAdmin = {
        correctAdminId: verifyToken.data.user_uuid,
        userName: verifyToken.data.userName || '',
        email: verifyToken.data.email || '',
        isAdmin: verifyToken.data.isAdmin || false
      };

      const correctAdminRepository = new CorrectAdminPrismaRepository();
      const ensureValidAdmin = new EnsureValidCorrectAdminController(correctAdminRepository);
      const admin = await ensureValidAdmin.handle(req, res) as OutputAdminDetailDTO

      req.correctAdmin = {
        correctAdminId: admin.uuid || '',
        userName: admin.userName || '',
        email: admin.email || '',
        isAdmin: admin.isAdmin || false
      };
      return next();
    }
  } catch (err: any) {
    console.log("Erro ao verificar token do correct Admin");
  }

  return res.status(401).json({
    error: "Authentication Error"
  });
};

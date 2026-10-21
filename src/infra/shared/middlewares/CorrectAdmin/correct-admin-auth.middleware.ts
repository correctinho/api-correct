import { Request, Response, NextFunction } from "express";
import { JWTToken } from "../../crypto/token/CorrectAdmin/jwt.token";
import { CorrectAdminPrismaRepository } from "../../../../modules/CorrectAdmin/repositories/implementations/correct-admin.prisma.repository";
import { EnsureValidCorrectAdminUsecase } from "./ensure-valid-correct-admin.usecase.middlware";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";

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

  //monolito mode
  const verifyToken = new JWTToken().validate(token);
  if (verifyToken && verifyToken.sub) {
    try {
      const correctAdminRepository = new CorrectAdminPrismaRepository();
      const validAdminUsecase = new EnsureValidCorrectAdminUsecase(correctAdminRepository);
      const admin = await validAdminUsecase.execute(new Uuid(verifyToken.sub));

      req.correctAdmin = {
        correctAdminId: admin.uuid,
        userName: admin.userName,
        email: admin.email,
        isAdmin: admin.isAdmin
      };

      return next();
    } catch (err: any) {
      return res.status(err.statusCode || 401).json({
        error: err.message || "Admin is not allowed to access"
      });
    }
  }

  return res.status(401).json({
    error: "Authentication Error"
  });
};

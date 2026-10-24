import { Request, Response, NextFunction } from "express";
import { CompanyAdminJWToken } from "../../crypto/token/CompanyAdmin/jwt.token";
import { AppUserJWToken } from "../../crypto/token/AppUser/jwt.token";
import { JWTToken as CorrectAdminJWToken } from "../../crypto/token/CorrectAdmin/jwt.token";
import { CompanyUserPrismaRepository } from "../../../../modules/Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { EnsureValidCompanyUserUsecase } from "../CompanyAdmin/ensure-valid-company-admin.usecase.middlware";
import { AppUserAuthPrismaRepository } from "../../../../modules/AppUser/AppUserManagement/repositories/implementations-user-auth/app-user-auth-prisma.repository";
import { EnsureValidAppUserUsecase } from "../AppUser/ensure-valid-app-user.usecase.middleware";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../databases/prisma.config";

export const supportIsAuth = async (req: Request, res: Response, next: NextFunction) => {
    const headerAuth = req.headers.authorization;
    if (!headerAuth) {
        return res.status(401).json({ error: "Token is missing" });
    }

    const [, token] = headerAuth.split(" ");
    if (!token) {
        return res.status(401).json({ error: "Token is missing" });
    }

    // 1. Tenta autenticar como CompanyUser (Empregador ou Parceiro)
    try {
        const verifyCompany = new CompanyAdminJWToken().validate(token);
        if (verifyCompany && verifyCompany.sub) {
            const companyUserRepository = new CompanyUserPrismaRepository();
            const validUserUsecase = new EnsureValidCompanyUserUsecase(companyUserRepository);
            const user = await validUserUsecase.execute(verifyCompany.sub);

            if (user) {
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
                };
                return next();
            }
        }
    } catch {
        // Continua
    }

    // 2. Tenta autenticar como AppUser (Mega App)
    try {
        const verifyAppUser = new AppUserJWToken().validate(token);
        if (verifyAppUser && verifyAppUser.sub) {
            const appUserAuthRepository = new AppUserAuthPrismaRepository();
            const validAppUserUsecase = new EnsureValidAppUserUsecase(appUserAuthRepository);
            const user = await validAppUserUsecase.execute(new Uuid(verifyAppUser.sub));

            if (user) {
                req.appUser = {
                    appUserId: user.uuid.uuid,
                    document: user.document,
                    email: user.email,
                    password: "",
                    transaction_pin: user.transaction_pin ? user.transaction_pin : null,
                    user_info_uuid: user.user_info_uuid ? user.user_info_uuid.uuid : null,
                    created_at: user.created_at,
                    updated_at: user.updated_at ? user.updated_at : null,
                };
                return next();
            }
        }
    } catch {
        // Continua
    }

    // 3. Tenta autenticar como CorrectAdmin
    try {
        const verifyAdmin = new CorrectAdminJWToken().validate(token);
        if (verifyAdmin && verifyAdmin.sub) {
            const admin = await prismaClient.correctAdmin.findUnique({
                where: { uuid: verifyAdmin.sub },
            });
            if (admin) {
                req.correctAdmin = {
                    correctAdminId: admin.uuid,
                    email: admin.email,
                    userName: admin.userName,
                    isAdmin: admin.isAdmin,
                };
                return next();
            }
        }
    } catch {
        // Continua
    }

    return res.status(401).json({ error: "Token inválido ou expirado." });
};

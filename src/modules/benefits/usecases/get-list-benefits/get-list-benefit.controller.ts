import { Request, Response } from 'express';
import { IBenefitsRepository } from '../../repositories/benefit.repository';
import { GetListBenefitUsecase } from './get-list-benefit.usecase';
import { CompanyAdminJWToken } from '../../../../infra/shared/crypto/token/CompanyAdmin/jwt.token';
import { CompanyUserPrismaRepository } from '../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository';
import { EnsureValidCompanyUserController } from '../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-auth.controller.middleware';
import { OutputCompanyUserDTO } from '../../../../infra/shared/middlewares/CompanyAdmin/ensure-valid-company-admin.usecase.middlware';

export class GetListBenefitController {
    constructor(private BenefitsRepository: IBenefitsRepository) { }

    async handle(req: Request, res: Response) {
        try {
            let business_info_uuid: string | undefined = undefined;

            // Tentativa de obter o token para identificar a empresa
            const headerAuth = req.headers.authorization;
            if (headerAuth) {
                const [, token] = headerAuth.split(" ");
                if (token) {
                    try {
                        const verifyToken = new CompanyAdminJWToken().validate(token);
                        if (verifyToken && verifyToken.sub) {
                            const companyUserRepository = new CompanyUserPrismaRepository();
                            const ensureValidUser = new EnsureValidCompanyUserController(companyUserRepository);
                            
                            // Mockamos o req.companyUser vazio apenas para o ensureValidUser funcionar
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
                                fantasy_name: '',
                                corporate_reason: '',
                                created_at: '',
                                updated_at: ''
                            };
                            
                            // Apenas chamamos para pegar os dados reais, ignorando se der erro
                            const user = await ensureValidUser.handle(req, res as any) as OutputCompanyUserDTO;
                            if (user && user.businessInfoUuid) {
                                business_info_uuid = user.businessInfoUuid;
                            }
                        }
                    } catch (e) {
                        // Se falhar a decodificação (ex: token de correct admin), ignoramos silenciosamente
                    }
                }
            }

            const getListBenefitUsecase = new GetListBenefitUsecase(
                this.BenefitsRepository
            );

            const resp = await getListBenefitUsecase.execute({ business_info_uuid });
            return res.json(resp);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message,
            });
        }
    }
}

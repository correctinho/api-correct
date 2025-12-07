import { Request, Response } from 'express';
import { ICompanyUserRepository } from '../../repositories/company-user.repository';
import { IServiceRequestRepository } from '../../../../ServiceScheduling/repositories/IServiceRequestRepository';
import { CompanyUserDetailsUsecase } from './company-user-details.usecase';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';

export class CompanyUserDetailsController {
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        private productsRepository: IProductRepository
    ) {}

    async handle(req: Request, res: Response) {
        try {
            const companyUser = req.companyUser;
            const user = {
                uuid: companyUser.companyUserId,
                business_info_uuid: companyUser.businessInfoUuid,
                is_admin: companyUser.isAdmin,
                document: companyUser.document,
                name: companyUser.name,
                email: companyUser.email,
                user_name: companyUser.userName,
                function: companyUser.function,
                permissions: companyUser.permissions,
                status: companyUser.status,
                created_at: companyUser.created_at,
                updated_at: companyUser.updated_at,
            };
            const usecase = new CompanyUserDetailsUsecase(
                this.serviceRequestRepository,
                this.productsRepository
            );
            const additionalData = await usecase.execute(
                companyUser.businessInfoUuid
            );

            return res.json({ ...user, ...additionalData });
        } catch (err: any) {
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message || 'Internal Server Error',
            });
        }
    }
}

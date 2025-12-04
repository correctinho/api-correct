import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../../errors/custom.error';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';
import { IServiceRequestRepository } from '../../../../ServiceScheduling/repositories/IServiceRequestRepository';
import { ICompanyUserRepository } from '../../repositories/company-user.repository';

export class CompanyUserDetailsUsecase {
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        private productsRepository: IProductRepository
    ) {}

    async execute(businessInfoUuid: string) {
        //company use details was already found in the middleware

        //here we are going to verify other possible datas from the user

        //get user service scheduling notifications

        const [pendingRequestsCount, hasSchedulingFeature] = await Promise.all([
            this.serviceRequestRepository.countPendingByBusiness(
                new Uuid(businessInfoUuid)
            ),
            this.productsRepository.hasBookableServices(new Uuid(businessInfoUuid))
            // Outros contadores futuros poderiam vir aqui
        ]);

        return {
            dashboard_state: {
                notifications: {
                    pending_service_requests: pendingRequestsCount,
                },
                features: {
                    has_scheduling: hasSchedulingFeature
                }
            },
        };
    }
}

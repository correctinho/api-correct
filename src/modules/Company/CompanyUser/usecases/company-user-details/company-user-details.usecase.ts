import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { IProductRepository } from '../../../../Ecommerce/Products/repositories/product.repository';
import { IServiceRequestRepository } from '../../../../ServiceScheduling/repositories/IServiceRequestRepository';
import { ICompanyDataRepository } from '../../../CompanyData/repositories/company-data.repository';
import { IBusinessContractRepository } from '../../../../Terms/repositories/business-contract.repository';

export class CompanyUserDetailsUsecase {
    constructor(
        private serviceRequestRepository: IServiceRequestRepository,
        private productsRepository: IProductRepository,
        private companyDataRepository: ICompanyDataRepository,
        private contractRepository: IBusinessContractRepository
    ) {}

    async execute(businessInfoUuid: string) {
        //company use details was already found in the middleware

        //here we are going to verify other possible datas from the user

        //get user service scheduling notifications

        const [pendingRequestsCount, hasSchedulingFeature, companyData] = await Promise.all([
            this.serviceRequestRepository.countPendingByBusiness(
                new Uuid(businessInfoUuid)
            ),
            this.productsRepository.hasBookableServices(new Uuid(businessInfoUuid)),
            this.companyDataRepository.findById(businessInfoUuid)
        ]);

        let business_status = companyData?.status;
        if (business_status === 'active' || business_status === 'pending_approval') {
            const contract = await this.contractRepository.findPendingByBusiness(businessInfoUuid);
            if (contract) {
                business_status = 'pending_contract';
            }
        }

        return {
            dashboard_state: {
                notifications: {
                    pending_service_requests: pendingRequestsCount,
                },
                features: {
                    has_scheduling: hasSchedulingFeature
                },
                business_status
            },
        };
    }
}

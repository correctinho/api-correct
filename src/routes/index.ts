import { Router } from 'express';
import { correctAdminRouter } from './CorrectAdmin/correct-admin.routes';
import { companyUserRouter } from './CompanyUser/company-user.routes';
import { companyDataRouter } from './CompanyData/company-data.routes';
import { appUserRouter } from './AppUser/app-user.routes';
import { businessRegisterRouter } from './BusinessFirstRegister/business-register.routes';
import { benefitsRouter } from './benefits/benefits.routes';
import { branchRouter } from './branch/branch.routes';
import { companyAddressRouter } from './CompanyAddress/company-address.routes';
import { contractsRouter } from './Contracts/contracts.routes';
import { businessItemDetailsRouter } from './BusinessItemDetails/business-item-details.routes';
import { appUserItemRouter } from './AppUserItem/app-user-item.routes';
import { groupsRouter } from './Groups/groups.routes';
import { transactionsRouter } from './Transactions/transactions.routes';
import { ecommerceRouter } from './Ecommerce/ecommerce.routes';

const router = Router();

router.use(correctAdminRouter);
router.use(companyUserRouter);
router.use(companyDataRouter);
router.use(appUserRouter);
router.use(companyAddressRouter)
router.use(businessRegisterRouter);
router.use(benefitsRouter);
router.use(branchRouter);
router.use(contractsRouter)
router.use(businessItemDetailsRouter)
router.use(appUserItemRouter)
router.use(groupsRouter)
router.use(transactionsRouter)
router.use(ecommerceRouter)

export { router };

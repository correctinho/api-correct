import { BusinessOrderPrismaRepository } from '../../../repositories/implementations/business-order-prisma.repository';
import { ListAllRechargeOrdersController } from './list-all-recharge-orders.controller';
import { CloudflareR2Storage } from '../../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage';

const businessOrderRepository = new BusinessOrderPrismaRepository();
const storageProvider = new CloudflareR2Storage();

export const listAllRechargeOrdersController = new ListAllRechargeOrdersController(
    businessOrderRepository,
    storageProvider
);

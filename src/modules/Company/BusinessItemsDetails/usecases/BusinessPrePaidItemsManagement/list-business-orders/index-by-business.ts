import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { ListBusinessOrdersByBusinessController } from "./list-business-orders-by-business.controller";
import { CloudflareR2Storage } from "../../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";

const businessOrderRepository = new BusinessOrderPrismaRepository();
const storageProvider = new CloudflareR2Storage();

const listBusinessOrdersByBusinessController = new ListBusinessOrdersByBusinessController(
    businessOrderRepository,
    storageProvider
);

export { listBusinessOrdersByBusinessController };

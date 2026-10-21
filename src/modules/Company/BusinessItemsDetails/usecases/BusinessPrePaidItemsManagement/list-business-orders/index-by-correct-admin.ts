import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { ListBusinessOrdersByCorrectAdminController } from "./list-business-orders-by-correct-admin.controller";
import { CloudflareR2Storage } from "../../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";

const businessOrderRepository = new BusinessOrderPrismaRepository();
const storage = new CloudflareR2Storage();

const listBusinessOrdersByCorrectAdminController = new ListBusinessOrdersByCorrectAdminController(
    businessOrderRepository,
    storage
);

export { listBusinessOrdersByCorrectAdminController };